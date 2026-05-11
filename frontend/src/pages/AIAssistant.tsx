import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline';
import { aiApi } from '../api/client';

const SUGGESTIONS = [
  { icon: '📋', text: 'Bugün ne yapmam gerekiyor?', desc: 'Günlük görev planı' },
  { icon: '👥', text: 'Kimler ne yapacak?', desc: 'İş dağılımını gör' },
  { icon: '⚡', text: 'En öncelikli görevim hangisi?', desc: 'Öncelik analizi' },
  { icon: '🗓️', text: 'Bu haftaki planım nedir?', desc: 'Haftalık özet' },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await aiApi.chat(userMsg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir hata oluştu, lütfen tekrar deneyin.' }]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-3xl mx-auto">

      <div className="flex-1 glass-card overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark">AI Asistan</p>
            <p className="text-[11px] text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full inline-block" />
              Çevrimiçi
            </p>
          </div>
        </div>

        {/* Messages / Empty state */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-dark mb-1">Merhaba, ben FocusFlow AI!</h2>
                <p className="text-sm text-muted max-w-sm">
                  Görevlerin, planın ve ekip iş dağılımın hakkında her şeyi sorabilirsin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => handleSend(s.text)}
                    className="text-left p-4 bg-slate-50 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl transition-all group"
                  >
                    <span className="text-xl mb-2 block">{s.icon}</span>
                    <p className="text-sm font-medium text-dark group-hover:text-primary transition-colors leading-snug">{s.text}</p>
                    <p className="text-[11px] text-muted mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {msg.role === 'user'
                        ? <UserIcon className="w-4 h-4" />
                        : <SparklesIcon className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-slate-50 border border-border text-dark rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                      <SparklesIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border border-border rounded-2xl rounded-tl-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 items-center bg-slate-50 border border-border rounded-xl px-4 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Mesajınızı yazın…"
              className="flex-1 bg-transparent text-sm text-dark placeholder-muted focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-40 flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted text-center mt-2">Enter ile gönder · FocusFlow AI, görev ve takvim verilerinizi kullanır</p>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;
