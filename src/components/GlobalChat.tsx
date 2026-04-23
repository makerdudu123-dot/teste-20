import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Send, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GlobalChat() {
  const { messages = [], sendMessage, user } = useGame();
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.id !== lastMessageId) {
        setUnreadCount(prev => prev + 1);
        setLastMessageId(latestMsg.id);
      }
    }
    if (isOpen) {
      setUnreadCount(0);
      if (messages.length > 0) {
        setLastMessageId(messages[messages.length - 1].id);
      }
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <div className={`fixed bottom-24 right-6 z-40 flex flex-col items-end transition-all duration-300 ${isOpen ? 'w-80' : 'w-12 h-12'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-medieval-wood border-2 border-medieval-gold/30 rounded-full text-medieval-gold hover:bg-medieval-gold hover:text-black transition-all shadow-medieval z-50 overflow-visible"
      >
        {isOpen ? <ChevronRight size={20} /> : <MessageSquare size={20} />}
        
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-medieval-blood text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-medieval-wood animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 flex flex-col h-96 w-80 bg-stone-950/95 backdrop-blur-2xl border-2 border-medieval-gold/30 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
              <MessageSquare size={14} className="text-medieval-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-medieval-gold">Chat Global da Taverna</span>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth"
            >
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-tight ${msg.userId === user?.uid ? 'text-medieval-gold' : 'text-stone-500'}`}>
                      {msg.username}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 bg-white/5 p-2 rounded-lg rounded-tl-none border border-white/5">
                    {msg.text}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-center text-center p-8">
                   <p className="text-[10px] text-stone-500 italic">O silêncio precede a batalha... comece a conversa!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
              <input 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Diga algo..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-medieval-gold/50"
              />
              <button 
                type="submit"
                disabled={!text.trim()}
                className="p-1.5 bg-medieval-gold text-black rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
