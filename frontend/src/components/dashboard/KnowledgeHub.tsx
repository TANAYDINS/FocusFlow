import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { aiApi } from '../../api/client';

const KnowledgeHub = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await aiApi.chat(input, messages.map(m => ({ role: m.role, content: m.content })));
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="glass-card flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <SparklesIcon className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">AI Asistan</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-400 font-medium">Çevrimiçi</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center gap-3 py-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Önerilen sorular</p>
            {[
              { icon: '📋', text: 'Bugün ne yapmam gerekiyor?' },
              { icon: '👥', text: 'Kimler ne yapacak?' },
              { icon: '⚡', text: 'En öncelikli görevim nedir?' },
              { icon: '📅', text: 'Yarınki planım nedir?' },
            ].map(s => (
              <button
                key={s.text}
                onClick={() => { setInput(s.text); }}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 rounded-xl transition-all group"
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-xs text-slate-600 group-hover:text-primary transition-colors font-medium">{s.text}</span>
              </button>
            ))}
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-slate-50 text-slate-700 rounded-bl-none border border-slate-100'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl rounded-bl-none border border-slate-100">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={sending}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="p-2.5 bg-primary text-white rounded-xl transition-all disabled:opacity-30 hover:bg-slate-800 shadow-md"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;
