import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsApi } from '../api/client';
import { ShieldCheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';

interface AppSettings {
  auto_schedule: boolean;
  telegram_enabled: boolean;
  telegram_connected: boolean;
  bot_username: string | null;
}

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-primary' : 'bg-slate-200'}`}
  >
    <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300 ${value ? 'right-0.5' : 'left-0.5'}`} />
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.getSettings().then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleToggle = async (val: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, auto_schedule: val });
    setSaving(true);
    try { await settingsApi.updateSettings({ auto_schedule: val }); } finally { setSaving(false); }
  };

  const botLink = settings?.bot_username ? `https://t.me/${settings.bot_username}` : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Ayarlar</h1>
          <p className="text-sm text-slate-500 mt-1">Uygulama tercihlerini ve entegrasyonları yönet.</p>
        </div>
        {saving && <span className="text-xs text-emerald-600 animate-pulse font-medium">Kaydediliyor…</span>}
      </div>

      <div className="max-w-2xl space-y-4">

        {/* AI Tercihleri */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Cog6ToothIcon className="w-4 h-4 text-primary" /></div>
            <h2 className="text-sm font-semibold text-dark">AI Tercihleri</h2>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-sm font-medium text-dark">Otomatik Planlama</h3>
              <p className="text-xs text-slate-500 mt-0.5">Yeni görevlere AI tarafından otomatik zaman atanır.</p>
            </div>
            <Toggle value={settings?.auto_schedule ?? true} onChange={handleToggle} />
          </div>
        </div>

        {/* Telegram */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 bg-[#229ED9] rounded-lg flex items-center justify-center">
              <span className="text-white font-black italic text-xs">T</span>
            </div>
            <h2 className="text-sm font-semibold text-dark">Telegram</h2>
          </div>

          {botLink ? (
            <div className="flex items-center gap-5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0">
                <QRCodeSVG value={botLink} size={90} fgColor="#4F46E5" />
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <p className="text-xs text-slate-500 text-center">Takım üyelerini bota bağlamak için QR kodu paylaş veya butona tıkla.</p>
                <a
                  href={botLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9] hover:bg-[#1a8abf] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <span className="font-black italic">T</span>
                  @{settings?.bot_username}
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              Bot bağlı değil. <code className="font-mono">TELEGRAM_BOT_TOKEN</code> ortam değişkenini ayarlayın.
            </div>
          )}
        </div>

        {/* Uygulama Bilgisi */}
        <div className="glass-card px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold text-dark">Uygulama Bilgisi</h3>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span>Versiyon <strong className="text-dark">1.0.5</strong></span>
              <span>Durum <strong className="text-emerald-600">Stabil</strong></span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Settings;
