'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm BookBot 👋 Ask me anything about BoiStore.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // All hooks run unconditionally, every render
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content:
              data.error || "Sorry, I couldn't respond. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Something went wrong. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Hide on dashboards and read pages — AFTER hooks
  const hidden =
    pathname?.startsWith('/dashboard') || pathname?.startsWith('/read');
  if (hidden) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#4B5D45] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">BookBot</p>
                <p className="text-[10px] text-white/70 leading-tight">
                  AI assistant · always online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAF9F6]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-[#4B5D45] text-white rounded-br-sm'
                      : 'bg-white text-[#1A1D1E] border border-[#E5E7EB] rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E7EB] px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-[#9CA3AF] animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-[#E5E7EB] p-3 flex gap-2 flex-shrink-0 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-3.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              aria-label="Send"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}