'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi, transformJob } from '@/lib/cloudflare-api';
import { JobCard } from './job-card';
import { Button } from '@/components/ui/button';
import { Tier } from '@/lib/types';
import { Send, Sparkles, Loader2, MessageSquare, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  jobs?: any[];
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch suggestions on mount
  useEffect(() => {
    chatApi.suggestions().then(data => setSuggestions(data.suggestions));
  }, []);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await chatApi.send(
        text,
        sessionId,
        messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      );
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        jobs: response.jobs?.map(transformJob),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I had trouble processing that. Try asking about specific roles like 'ML internships' or 'remote SWE jobs'.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-[#12121a] border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <span className="font-semibold text-white">TierJobs AI</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-white/50" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-white/50 text-sm text-center">
              Ask me anything about jobs at elite tech companies
            </p>
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="w-full p-3 text-left text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white/10 text-white/90'
              } rounded-2xl px-4 py-2`}>
                <p className="text-sm">{msg.content}</p>
                {msg.jobs && msg.jobs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.jobs.slice(0, 5).map((job) => (
                      <a
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                      >
                        <div className="font-medium text-sm">{job.title}</div>
                        <div className="text-xs text-white/60">
                          {job.company} • {job.tier}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-white/[0.06]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about jobs..."
            className="flex-1 bg-white/5 border border-white/[0.06] rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
