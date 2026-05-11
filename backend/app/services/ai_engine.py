import os
import json
import re
import datetime
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = None
if OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"OpenAI client error: {e}")
else:
    print("WARNING: OPENAI_API_KEY not found.")

MODEL = "gpt-4o-mini"


def _chat(system: str, user: str, json_mode: bool = False) -> str:
    kwargs = {"model": MODEL, "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}], "temperature": 0.3}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content.strip()


def _normalize_times(text: str) -> str:
    """Pre-process: 'saat 5' → 'saat 17:00' before sending to OpenAI."""
    def fix(m):
        hour = int(m.group(1))
        minute = m.group(2) or "00"
        before = text[:m.start()].lower()[-30:]
        if any(w in before for w in ["gece", "sabah", "öğlen"]):
            return m.group(0)
        if 1 <= hour <= 6:
            hour += 12
        return f"saat {hour:02d}:{minute}"
    return re.sub(r'saat\s+(\d{1,2})(?::(\d{2}))?', fix, text, flags=re.IGNORECASE)


def _fix_deadline_hour(deadline: str | None) -> str | None:
    """Last-resort fix: if hour still 1-6, shift to PM."""
    if not deadline:
        return deadline
    try:
        dt = datetime.datetime.fromisoformat(deadline)
        if 1 <= dt.hour <= 6:
            dt += datetime.timedelta(hours=12)
        return dt.isoformat()
    except Exception:
        return deadline


def analyze_tasks_from_text(text: str, current_time: str = None) -> List[Dict]:
    if not client:
        return _mock_task_extraction(text)

    if current_time:
        try:
            now = datetime.datetime.fromisoformat(current_time.replace('Z', '+00:00'))
        except Exception:
            now = datetime.datetime.now()
    else:
        now = datetime.datetime.now()
    
    today    = now.strftime("%Y-%m-%d")
    tomorrow = (now + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    now_hhmm = now.strftime("%H:%M")

    system = f"""Sen bir üretkenlik asistanısın. Kullanıcının metninden görevleri çıkar ve JSON döndür.

BUGÜN: {today} | YARIN: {tomorrow} | ŞU AN: {now_hhmm}

━━━ KİŞİ ATAMA KURALLARI (EN ÖNEMLİ) ━━━
Metinde bir insan adı geçiyorsa assigned_to alanını MUTLAKA doldur.

Türkçe kalıplar — bunların HEPSİNDE assigned_to dolu olmalı:
  "Ahmet'in toplantısı var"          → assigned_to: "Ahmet"
  "Ahmet yarın scrum'a katılacak"    → assigned_to: "Ahmet"
  "Hakan rapor yazacak"              → assigned_to: "Hakan"
  "Ali'nin sunumu var"               → assigned_to: "Ali"
  "Veli halleder"                    → assigned_to: "Veli"
  "Fatma ile toplantı"               → assigned_to: "Fatma"
  "Mehmet sorumlu"                   → assigned_to: "Mehmet"
  "Can bunu yapacak"                 → assigned_to: "Can"
  "Zeynep'e bırak"                   → assigned_to: "Zeynep"

Kural: Türkçe iyelik eki (-'in, -'ın, -'nin, -'nın, -'ün, -'nün, -'un, -'nun)
veya fiil öznesinde büyük harfle başlayan kişi adı → o kişiye ata.
"Ben/benim/bende" gibi ifadeler → assigned_to: null (kişisel görev)

━━━ SAAT KURALLARI (24 saat formatı) ━━━
- Kullanıcı "saat 20" diyorsa bu 20:00'dır. Asla 08:00 yapma.
- "sabah 9" → 09:00 | "saat 9" → 09:00 | "akşam 8" → 20:00
- "öğleden sonra 3" → 15:00 | "akşam 6" → 18:00 | "gece 11" → 23:00
- Belirsiz 1-7 arası saatler için (örn. sadece "saat 5") → +12 ekleyerek PM yap (17:00).
- Eğer saat zaten 12'den büyükse (örn. 20) olduğu gibi bırak.
- Geçmiş saatler için (şu an {now_hhmm} ise ve kullanıcı "saat 8" dediyse) → {tomorrow} tarihine taşı.

━━━ SÜRE (dk) ━━━ toplantı/scrum=45, rapor=90, sunum=120, kod=120, sprint=60

━━━ ÇIKTI ━━━ Sadece JSON, başka hiçbir şey:
{{"tasks": [
  {{"title": "kısa görev adı", "estimated_duration": 45, "deadline": "{today}T09:00:00 veya null", "priority": "High|Medium|Low", "assigned_to": "kişi adı veya null"}}
]}}"""

    normalized = _normalize_times(text)
    try:
        raw = _chat(system, f'Metin: "{normalized}"', json_mode=True)
        data = json.loads(raw)
        tasks = data.get("tasks", data) if isinstance(data, dict) else data
        if not tasks:
            return _mock_task_extraction(text)
        for t in tasks:
            t["deadline"]            = _fix_deadline_hour(t.get("deadline"))
            t["estimated_duration"]  = t.get("estimated_duration") or 45
            t["priority"]            = t.get("priority") or "Medium"
            t["assigned_to"]         = t.get("assigned_to") or None
        return tasks
    except Exception as e:
        print(f"OpenAI analyze error: {e}")
        return _mock_task_extraction(text)


def _mock_task_extraction(text: str) -> List[Dict]:
    text_lower = text.lower()
    parts = re.split(r' ve | ayrıca |,|;|\.', text_lower)
    results = []
    is_tomorrow = "yarın" in text_lower
    now = datetime.datetime.now()
    target_date = now + datetime.timedelta(days=1) if is_tomorrow else now

    mappings = [
        (["randevu", "toplantı", "meeting"], "Toplantı/Randevu", 45, "High"),
        (["rapor", "report", "yazı"], "Rapor Hazırlama", 90, "Medium"),
        (["sunum", "presentation"], "Sunum Tasarımı", 120, "High"),
        (["ders", "çalış", "study", "okul"], "Ders Çalışması", 60, "Medium"),
        (["spor", "gym", "egzersiz", "maç", "futbol"], "Spor", 90, "Low"),
        (["kod", "yazılım", "dev", "proje", "program"], "Yazılım Geliştirme", 120, "High"),
        (["yemek", "mutfak"], "Yemek Molası", 30, "Low"),
    ]

    for part in parts:
        part = part.strip()
        if not part:
            continue
        time_match = re.search(r'saat\s*(\d{1,2})(?::(\d{2}))?|(\d{1,2}):(\d{2})', part)
        deadline = None
        if time_match:
            try:
                if time_match.group(1) is not None:
                    h, m = int(time_match.group(1)), int(time_match.group(2) or 0)
                else:
                    h, m = int(time_match.group(3)), int(time_match.group(4))
                morning = any(w in part for w in ['sabah', 'gece yarısı'])
                night   = any(w in part for w in ['gece', 'yarıgece'])
                if 1 <= h <= 6 and not morning and not night:
                    h += 12
                deadline = target_date.replace(hour=h, minute=m, second=0, microsecond=0).isoformat()
            except Exception:
                pass

        found = False
        for kws, title, dur, prio in mappings:
            if any(kw in part for kw in kws):
                results.append({"title": title, "estimated_duration": dur, "priority": prio, "deadline": deadline, "assigned_to": None})
                found = True
                break
        if not found and len(part) > 3:
            results.append({"title": f"Görev: {part[:30].strip()}", "estimated_duration": 45, "priority": "Medium", "deadline": deadline, "assigned_to": None})

    return results


def generate_planner_insights(tasks: List[Dict]) -> str:
    if not client or not tasks:
        return "Görevleriniz analiz edildi. Öncelikli olanlara odaklanmanızı öneririm."
    try:
        return _chat(
            "Sen kısa ve motive edici bir üretkenlik koçusun. 2-3 cümle, Türkçe.",
            f"Bu görevlere bakarak bugün nasıl yaklaşılmalı: {json.dumps(tasks, ensure_ascii=False)}"
        )
    except Exception as e:
        print(f"Insights error: {e}")
        return "Görevlerinizi öncelik sırasına göre ele alın."


def calculate_priority_score(title: str, stress_level: int) -> float:
    if not client:
        return min(95.0, max(20.0, stress_level * 17.0 + 13.0))
    try:
        raw = _chat(
            "Görev başlığı ve stres seviyesine göre 1-100 arası öncelik puanı döndür. SADECE sayı yaz.",
            f"Görev: {title}, Stres: {stress_level}"
        )
        nums = re.findall(r'\d+', raw)
        return float(nums[0]) if nums else 50.0
    except Exception:
        return 50.0


def analyze_email(content: str) -> Dict:
    if not client:
        return {"summary": "AI bağlantısı yok.", "is_urgent": 0}
    try:
        raw = _chat(
            'E-postayı analiz et. JSON döndür: {"summary": "tek cümle özet", "is_urgent": 0 veya 1}',
            f'E-posta: "{content}"',
            json_mode=True
        )
        return json.loads(raw)
    except Exception as e:
        print(f"Email analyze error: {e}")
        return {"summary": "Analiz hatası.", "is_urgent": 0}


def extract_actions_from_note(content: str) -> List[Dict]:
    if not client:
        return []
    try:
        raw = _chat(
            'Nottan eyleme dönüştürülebilir görevleri çıkar. JSON: {"tasks": [{"title":"...","estimated_duration":60,"priority":"High|Medium|Low"}]}',
            f'Not: "{content}"',
            json_mode=True
        )
        data = json.loads(raw)
        return data.get("tasks", [])
    except Exception as e:
        print(f"Note extract error: {e}")
        return []


def generate_comprehensive_briefing(tasks: List[Dict], emails: List[Dict]) -> str:
    if not client:
        return "Günlük özetiniz hazır. Odaklanmaya devam edin!"
    try:
        return _chat(
            "Kısa (100 kelime altı), motive edici ve profesyonel günlük özet yaz. Türkçe. Sadece metni yaz.",
            f"Görevler: {json.dumps(tasks, ensure_ascii=False)}\nAcil e-postalar: {json.dumps(emails, ensure_ascii=False)}"
        )
    except Exception as e:
        print(f"Briefing error: {e}")
        return "Bugün verimli bir gün olacak. Öncelikli görevinize odaklanın!"


def generate_detailed_daily_plan(tasks: List[Dict], schedules: List[Dict]) -> str:
    now = datetime.datetime.now()
    today    = now.strftime("%Y-%m-%d")
    now_hhmm = now.strftime("%H:%M")
    total_min = sum(t.get('estimated_duration', 60) for t in tasks)

    if not client:
        if not tasks:
            return "Bugün için bekleyen görev bulunamadı."
        lines = [f"Bugünkü Görevler ({now_hhmm})\n"]
        for i, t in enumerate(tasks, 1):
            lines.append(f"{i}. {t.get('title','Görev')} — {t.get('estimated_duration',60)} dk")
        return "\n".join(lines)

    try:
        return _chat(
            f"""Sen deneyimli bir üretkenlik koçu ve proje yöneticisisin.
Tarih: {today} | Şu an: {now_hhmm} | Toplam: {len(tasks)} görev, {total_min} dk

6 bölümlü, tablo formatlı günlük iş planı oluştur:
1️⃣ GENEL ÖZET — toplam süre, yoğunluk, en kritik görev
2️⃣ ÖNCELİK SIRASI — tablo: # | Görev | Öncelik | Süre | Neden
3️⃣ SAAT BAZLI PLAN — {now_hhmm}'dan itibaren, tablo: Saat | Bitiş | Görev | Tür | Not
   (Tür: 🧠Derin / ⚡Hızlı / 🤝Toplantı / ☕Mola) — paralel işleri "↕" ile işaretle
4️⃣ KRİTİK TARİHLER — tablo: Görev | Deadline | Risk | Önlem
5️⃣ OTOMASYON ÖNERİLERİ — madde madde
6️⃣ AI KULLANIM ÖNERİLERİ — madde madde

Türkçe, emoji kullan (🔴🟡🟢⚡🧠🤝☕), tablo formatını koru, giriş/kapanış yazma.""",
            f"Görevler:\n{json.dumps(tasks, ensure_ascii=False, indent=2)}\n\nTakvim:\n{json.dumps(schedules, ensure_ascii=False, indent=2)}"
        )
    except Exception as e:
        print(f"Daily plan error: {e}")
        return "Plan oluşturulurken hata oluştu."


def chat_assistant(message: str, history: List[Dict], tasks: List[Dict], schedules: List[Dict]) -> str:
    now = datetime.datetime.now()

    if not client:
        return "AI bağlantısı yok. Lütfen OPENAI_API_KEY'i kontrol edin."

    personal_tasks = [t for t in tasks if not t.get("assigned_to")]
    work_tasks     = [t for t in tasks if t.get("assigned_to")]

    messages = [
        {"role": "system", "content": f"""Sen FocusFlow AI asistanısın — kişisel üretkenlik koçu ve iş takip asistanı.
Şu an: {now.strftime("%Y-%m-%d %H:%M")}

KİŞİSEL GÖREVLER:
{json.dumps(personal_tasks, ensure_ascii=False) if personal_tasks else "Yok."}

ATANMIŞ İŞLER:
{json.dumps(work_tasks, ensure_ascii=False) if work_tasks else "Yok."}

TAKVİM:
{json.dumps(schedules, ensure_ascii=False) if schedules else "Boş."}

KURALLAR:
- Türkçe, kısa ve net (maks 120 kelime)
- Listeleri MUTLAKA her madde yeni satırda olacak şekilde (bullet points) yap.
- "bugün ne yapacağım/yapmalıyım" → kişisel görevleri saat ve öncelikle listele
- "kimler ne yapacak/iş dağılımı" → atanmış işleri kişi bazında listele
- "bugün ne yapacağız" → ikisinin özetini ver
- Selam → sıcak karşılama
- Genel soru → koç gibi tavsiye"""}
    ]

    for h in history[-8:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": message})

    try:
        resp = client.chat.completions.create(model=MODEL, messages=messages, temperature=0.5, max_tokens=300)
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chat error: {e}")
        return "Bir hata oluştu, lütfen tekrar deneyin."
