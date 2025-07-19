import React, { useState, useEffect, useRef } from 'react';
import { streamMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';

const StyleAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        sender: 'bot',
        text: "Hi! I'm Stylo, your personal fashion advisor. How can I help you find the perfect look today? ✨"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

    try {
      const stream = streamMessage(userMessage.text, sessionId);
      let text = '';
      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, text } : msg
        ));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
       setMessages(prev => prev.slice(0, -1)); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        aria-label="Open Style Advisor"
      >
        <ChatIcon className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-3/4 max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <header className="bg-teal-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="text-lg font-bold">Stylo - AI Fashion Advisor</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <CloseIcon className="h-6 w-6" />
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                   {msg.text === '' && msg.sender === 'bot' ? (
                       <div className="flex items-center justify-center space-x-1">
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                       </div>
                   ) : (
                       msg.text
                   )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
             {error && <div className="text-red-500 text-sm p-2 text-center">{error}</div>}
          </main>

          <footer className="p-4 border-t bg-white rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for fashion advice..."
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 disabled:bg-gray-400 transition-colors"
                disabled={isLoading || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 h-5 w-5"><path d="M2 21l21-9L2 3v7l15 2-15 2z"></path></svg>
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
};

export default StyleAdvisor;
