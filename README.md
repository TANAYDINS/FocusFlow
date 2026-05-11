<div align="center">

# 🎯 FocusFlow AI

**Yapay zeka destekli kişisel üretkenlik ve ekip iş takip platformu**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://telegram.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Doğal dille görev girişi · Otomatik günlük planlama · Ekip iş ataması · Telegram entegrasyonu*

</div>

---

## ✨ Özellikler

<table>
<tr>
<td width="50%">

### 🤖 AI Planlayıcı
Düşüncelerini yaz, AI görevlere dönüştürsün.

```
"Yarın saat 10'da toplantım var ve
 Ahmet'in raporunu kontrol etmem lazım"
```
↓
- ✅ `Toplantı` → 10:00, 60 dk
- ✅ `Rapor kontrolü` → Ahmet'e atandı

</td>
<td width="50%">

### 📅 Akıllı Zaman Çizelgesi
Deadline'a göre sıralı, boşluk dolduran günlük program.

```
09:00 ████████░░ Haftalık rapor (90 dk)
10:30 ████░░░░░░ Müşteri toplantısı (45 dk)
14:00 ██████░░░░ Kod review (60 dk)
16:00 ████░░░░░░ Sunum hazırlığı (45 dk)
```

</td>
</tr>
<tr>
<td width="50%">

### 👥 Ekip İş Takibi
Kişilere görev ata, iş dağılımını görüntüle.

| Kişi | Görev | Süre |
|------|-------|------|
| Ahmet | Rapor Hazırlama | 90 dk |
| Ayşe | Kod Review | 60 dk |
| Mehmet | Sunum Tasarımı | 120 dk |

</td>
<td width="50%">

### 📱 Telegram Bot
Telegram'dan görev ekle, listele, ekibini yönet.

```
👤 Sen: "Ahmet pazartesi rapor yazacak"

🤖 Bot: 📋 Şu görevi ekleyeyim mi?
  • Rapor Hazırlama
    👤 Ahmet · ⏱ 90 dk

  [✅ Evet] [❌ İptal]
```

</td>
</tr>
<tr>
<td width="50%">

### 💬 AI Asistan
Chatbot ile görevlerini sorgula, plan al.

- *"Bugün ne yapmam gerekiyor?"*
- *"En öncelikli görevim nedir?"*
- *"Yarınki planım nedir?"*
- *"Kimler ne yapacak?"*

</td>
<td width="50%">

### ⏱ Odak Modu (Pomodoro)
Her görev için yerleşik Pomodoro sayacı.

```
🎯 Haftalık Rapor

    25:00
  ████████████░░░░

  [⏸ Duraklat] [⏹ Bitir]
```

</td>
</tr>
</table>

---

## 🏗️ Mimari

```
FocusFlowai/
├── 🐍 backend/                    # FastAPI + Python
│   ├── main.py                   # Uygulama girişi, lifespan, reminder loop
│   ├── requirements.txt
│   ├── .env.example              # Güvenli şablon
│   └── app/
│       ├── models.py             # SQLAlchemy ORM (User, Task, Schedule, TelegramUser)
│       ├── schemas.py            # Pydantic v2 doğrulama
│       ├── database.py           # SQLite bağlantısı
│       ├── routers/
│       │   ├── ai.py             # /ai/analyze · /ai/daily-plan · /ai/chat
│       │   ├── tasks.py          # CRUD: oluştur, güncelle, sil
│       │   ├── schedule.py       # Takvim algoritması
│       │   ├── briefing.py       # Günlük özet
│       │   ├── analytics.py      # Verimlilik verileri
│       │   ├── notes.py          # Notlar
│       │   └── settings.py       # Ayarlar + Telegram yönetimi
│       └── services/
│           ├── ai_engine.py      # OpenAI entegrasyonu + Türkçe zaman ayrıştırıcı
│           └── telegram_service.py # python-telegram-bot v22 async bot
│
└── ⚛️  frontend/                   # React 18 + TypeScript + Vite
    └── src/
        ├── App.tsx               # Router, FocusOverlay state
        ├── api/client.ts         # Axios istemcisi
        ├── pages/
        │   ├── Dashboard.tsx     # Widget paneli
        │   ├── Tasks.tsx         # Görevlerim / İşler sekmeleri
        │   ├── AIPlanner.tsx     # Düşünce analizi + zaman çizelgesi
        │   ├── Workflow.tsx      # Kişi bazlı iş dağılımı
        │   ├── AIAssistant.tsx   # Tam sayfa chatbot
        │   ├── Analytics.tsx     # Grafikler ve istatistikler
        │   └── Settings.tsx      # Ayarlar + Telegram QR
        └── components/
            ├── Sidebar.tsx
            ├── Header.tsx
            ├── TaskModal.tsx
            ├── FocusOverlay.tsx  # Pomodoro sayacı
            └── dashboard/
                ├── AIDailyBriefing.tsx
                ├── PriorityTasks.tsx
                ├── FocusTimeline.tsx
                └── KnowledgeHub.tsx  # Dashboard chatbot
```

---

## 🔄 Veri Akışı

```
Kullanıcı Girdisi
      │
      ▼
┌─────────────┐    normalize_times()     ┌──────────────┐
│  Frontend   │ ─── "saat 5" → "17:00" ─▶│   ai_engine  │
│  React/TS   │                          │  GPT-4o-mini │
└─────────────┘ ◀── extracted_tasks ─── └──────────────┘
      │                                        │
      ▼                                        ▼
┌─────────────┐                        ┌──────────────┐
│  FastAPI    │ ◀── /tasks/bulk ──────  │  fix_deadline│
│  Routers   │                          │  _hour()     │
└─────────────┘                        └──────────────┘
      │
      ▼
┌─────────────┐    schedule algorithm    ┌──────────────┐
│   SQLite    │ ──────────────────────▶  │  Telegram    │
│     DB      │                          │  Reminders   │
└─────────────┘                          └──────────────┘
```

---

## 🚀 Kurulum

### Gereksinimler

- Python **3.10+**
- Node.js **18+**
- OpenAI API anahtarı → [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- *(Opsiyonel)* Telegram Bot Token → [@BotFather](https://t.me/BotFather)

### 1. Repoyu Klonla

```bash
git clone https://github.com/TANAYDINS/FocusFlowai.git
cd FocusFlowai
```

### 2. Backend Kurulumu

```powershell
cd backend

# Sanal ortam oluştur ve bağımlılıkları yükle
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt

# Ortam değişkenlerini ayarla
copy .env.example .env
# .env dosyasını düzenle → OPENAI_API_KEY değerini gir
```

### 3. Frontend Kurulumu

```powershell
cd frontend
npm install
node node_modules/.bin/vite
```

### 4. Çalıştır

**Tek komutla (Windows):**
```powershell
.\start.bat
```

**Manuel:**
```powershell
# Terminal 1 — Backend
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Servis | URL |
|--------|-----|
| 🖥️ Frontend | http://localhost:5173 |
| ⚡ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |

---

## 🔐 Ortam Değişkenleri

`backend/.env` dosyası (`.env.example`'dan kopyala):

```env
# Zorunlu — GPT-4o-mini için
OPENAI_API_KEY=sk-proj-...

# Opsiyonel — Telegram bot aktif etmek için
TELEGRAM_BOT_TOKEN=
```

> ⚠️ `.env` dosyası `.gitignore` ile korunmaktadır, **asla commit etmeyin.**

---

## 📱 Telegram Bot Kullanımı

### Bağlantı

1. **Ayarlar** sayfasına git
2. QR kodu tara **veya** `@focusflows_bot` butonuna tıkla
3. Bota `/start` gönder → bağlantı kuruldu ✅

### Komutlar

| Komut / Mesaj | Açıklama |
|--------------|----------|
| `/start` | Bota bağlan |
| `/gorevler` | Kişisel görevler ve atanmış işler |
| `/is` | Kişi bazlı iş dağılımı |
| `/yardim` | Yardım mesajı |

### Serbest Metin (AI ile)

```
Sen: "Yarın saat 10'da sunum hazırlayacağım"

Bot analiz eder → onay ister → ✅ onaylanınca kaydeder
```

```
Sen: "Ahmet Çarşamba raporu yazacak"

Bot: 👤 Ahmet'e iş atandı ✅
```

> 💡 Birden fazla kişi QR kodu tarayarak bota katılabilir. **Ayarlar → Telegram** sayfasından QR kodu paylaşın.

---

## 📡 API Referansı

### Görevler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/tasks/` | Tüm görevleri listele |
| `POST` | `/tasks/create` | Tek görev ekle |
| `POST` | `/tasks/bulk` | Toplu görev ekle |
| `PATCH` | `/tasks/{id}` | Görevi güncelle |
| `DELETE` | `/tasks/{id}` | Görevi sil |

### AI

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/ai/analyze` | Metinden görev çıkar |
| `POST` | `/ai/daily-plan` | Detaylı günlük plan üret |
| `POST` | `/ai/chat` | AI asistanla sohbet |

### Takvim

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/schedule/` | Mevcut takvimi getir |
| `POST` | `/schedule/generate` | Takvimi yeniden oluştur |

### Ayarlar & Telegram

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/settings/` | Uygulama ayarlarını getir |
| `PUT` | `/settings/` | Ayarları güncelle |
| `GET` | `/settings/telegram/users` | Bağlı kullanıcıları listele |
| `DELETE` | `/settings/telegram/users/{chat_id}` | Kullanıcıyı çıkart |

---

## 🛠️ Teknoloji Yığını

### Backend
| Teknoloji | Sürüm | Kullanım |
|-----------|-------|----------|
| FastAPI | 0.104+ | REST API framework |
| SQLAlchemy | 2.x | ORM |
| SQLite | — | Veritabanı (MVP) |
| Pydantic | v2 | Veri doğrulama |
| python-telegram-bot | v22 | Async Telegram bot |
| openai | latest | GPT-4o-mini entegrasyonu |
| python-dotenv | — | Ortam değişkenleri |

### Frontend
| Teknoloji | Sürüm | Kullanım |
|-----------|-------|----------|
| React | 18 | UI framework |
| TypeScript | 5 | Tip güvenliği |
| Vite | 5 | Build aracı |
| Tailwind CSS | 3 | Utility-first CSS |
| Framer Motion | — | Animasyonlar |
| Axios | — | HTTP istemcisi |
| React Router | v6 | Sayfa yönlendirme |
| qrcode.react | — | QR kod üretimi |
| Heroicons | v2 | İkon seti |

---

## 🔒 Güvenlik

- `backend/.env` → `.gitignore` ile git'ten dışlanmıştır
- `backend/venv/` ve `frontend/node_modules/` takip edilmez
- `.vscode/` workspace ayarları takip edilmez
- API anahtarlarını kaynak koduna **asla** yazmayın
- Üretimde CORS ayarlarını kısıtlayın (`main.py`)
- Üretim ortamı için SQLite yerine **PostgreSQL** önerilir

---

## 🗺️ Yol Haritası

- [ ] Çok kullanıcılı auth sistemi (JWT)
- [ ] PostgreSQL desteği
- [ ] Mobil uygulama (React Native)
- [ ] Takvim senkronizasyonu (Google Calendar)
- [ ] E-posta entegrasyonu
- [ ] Haftalık AI raporu

---

<div align="center">

**FocusFlow AI** · MIT Lisansı · [@TANAYDINS](https://github.com/TANAYDINS)

</div>
