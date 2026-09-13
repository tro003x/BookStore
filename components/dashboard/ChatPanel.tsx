'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string | null;
  email: string;
  role: string;
  unread: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function ChatPanel({ initialUserId }: { initialUserId?: string }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedUserId = searchParams.get('userId');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(
    initialUserId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myId = session?.user?.id;

  // Preselect from URL once contacts load
  useEffect(() => {
    if (preselectedUserId && !activeUserId) {
      setActiveUserId(preselectedUserId);
    }
  }, [preselectedUserId, activeUserId]);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Contacts fetch error:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchThread = async (userId: string, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetch(`/api/messages/${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Thread fetch error:', err);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    fetchThread(activeUserId);

    const interval = setInterval(() => {
      fetchThread(activeUserId, true);
      fetchContacts();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeUserId) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeUserId,
          content: input.trim(),
        }),
      });
      if (res.ok) {
        setInput('');
        fetchThread(activeUserId, true);
        fetchContacts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const activeContact = contacts.find((c) => c.id === activeUserId);

  const roleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'AUTHOR') return 'Author';
    if (role === 'PUBLISHER') return 'Publisher';
    return role;
  };

  const initials = (name: string | null, email: string) => {
    const src = name || email.split('@')[0];
    return src.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      {/* Contacts list */}
      <div className="w-72 flex-shrink-0 border-r border-[#E5E7EB] flex flex-col">
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="font-['Fraunces'] text-base font-semibold text-[#0C0A00]">
            Messages
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-xs text-[#6B7280]">No contacts available</p>
            </div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveUserId(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#F5F2EC] transition-colors ${
                  activeUserId === c.id ? 'bg-[#14B8A6]/5' : 'hover:bg-[#F5F2EC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#14B8A6]/15 text-[#0D9488] flex items-center justify-center text-xs font-semibold shrink-0">
                    {initials(c.name, c.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-medium text-[#0C0A00] truncate">
                        {c.name || c.email.split('@')[0]}
                      </p>
                      {c.unread > 0 && (
                        <span className="bg-[#14B8A6] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                        {roleLabel(c.role)}
                      </span>
                    </div>
                    {c.lastMessage && (
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">
                Select a contact to start chatting
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#14B8A6]/15 text-[#0D9488] flex items-center justify-center text-xs font-semibold">
                {activeContact &&
                  initials(activeContact.name, activeContact.email)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0C0A00]">
                  {activeContact?.name ||
                    activeContact?.email.split('@')[0] ||
                    'User'}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {activeContact && roleLabel(activeContact.role)}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAF9F6]">
              {loadingThread ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-[#6B7280]">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === myId;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                          mine
                            ? 'bg-[#4B5D45] text-white rounded-br-sm'
                            : 'bg-white text-[#1A1D1E] border border-[#E5E7EB] rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {m.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            mine ? 'text-white/60' : 'text-[#9CA3AF]'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="border-t border-[#E5E7EB] p-3 flex gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}