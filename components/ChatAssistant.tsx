
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { sendChatMessage, ChatMessage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola Coach! Soy tu asistente GRIT. ¿Dudas con la programación de hoy, adaptaciones o fisiología?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión. Inténtalo de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-brand-yellow text-brand-black rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-110 transition-transform duration-300 animate-in fade-in zoom-in"
          title="Abrir Asistente GRIT"
        >
          <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-brand-black border border-brand-gray rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          <div className="bg-brand-gray/50 p-4 border-b border-brand-gray flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-yellow rounded-full">
                <Bot className="w-5 h-5 text-brand-black" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase tracking-wide text-white leading-none">GRIT AI</h3>
                <p className="text-[10px] text-green-500 font-mono tracking-wider uppercase mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Engine Active
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-black/95 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                  ${msg.role === 'user' ? 'bg-gray-700' : 'bg-brand-yellow'}
                `}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-black" />}
                </div>
                
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-3 text-sm
                  ${msg.role === 'user' 
                    ? 'bg-gray-800 text-white rounded-tr-none' 
                    : 'bg-brand-gray text-gray-200 rounded-tl-none border border-gray-700'}
                `}>
                  <ReactMarkdown 
                    className="prose prose-invert prose-p:leading-relaxed prose-sm max-w-none"
                    components={{
                       p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-brand-black" />
                 </div>
                 <div className="bg-brand-gray border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-yellow" />
                    <span className="ml-2 text-xs text-gray-400">Procesando...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-brand-gray/30 border-t border-brand-gray backdrop-blur-sm">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pregunta a la IA de GRIT..."
                className="flex-1 bg-brand-black border border-brand-gray rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-brand-yellow transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-brand-yellow text-brand-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
