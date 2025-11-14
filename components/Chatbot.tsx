
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, PlantInfo } from '../types';
import { Spinner } from './common/Spinner';
import { Icon } from './common/Icon';

interface ChatbotProps {
  identifiedPlant: PlantInfo | null;
  onGreetingSent: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ identifiedPlant, onGreetingSent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
        chatRef.current = createChatSession();
        setMessages([{ role: 'model', content: "Hello there, fellow plant lover! I'm Verde, and I'm SO excited to help your garden thrive! 🌱 What plant are we pampering today? You can ask me anything, like 'Why are my monstera's leaves turning yellow?' or 'How often should I water my succulent?' Let's get growing!" }]);
        hasInitialized.current = true;
    }
  }, []);
  
  useEffect(() => {
    if (identifiedPlant) {
      const greetingMessage: ChatMessage = {
        role: 'model',
        content: `Oh, a ${identifiedPlant.plantName}! What a gorgeous choice! I see you've already got the basics. I'd be thrilled to share some extra secrets to help it flourish. What are you curious about? You could ask about the best fertilizer, how to propagate it, or maybe common pests to watch out for.`
      };
      setMessages(prev => [...prev, greetingMessage]);
      onGreetingSent(); 
    }
  }, [identifiedPlant, onGreetingSent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const responseStream = await chatRef.current.sendMessageStream({ message: input });
        
        let modelResponse = '';
        setMessages((prev) => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of responseStream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = modelResponse;
                return newMessages;
            });
        }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 4.293a1 1 0 011.414 1.414l-9 9a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l8.293-8.293z" />
                     </svg>
                </div>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Spinner size="w-5 h-5" />
                 </div>
                 <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                     <p className="text-sm italic">Verde is thinking...</p>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Verde about a specific plant..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Icon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
