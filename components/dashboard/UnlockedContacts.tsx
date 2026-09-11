'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface UnlockedProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: 'AUTHOR' | 'PUBLISHER';
  unlockedAt: string;
}

export default function UnlockedContacts() {
  const [contacts, setContacts] = useState<UnlockedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/directory/unlocked-contacts');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#F5F2EC] mb-4">
          <Lock className="h-6 w-6 text-[#6B7280]" />
        </div>
        <h2 className="font-['Fraunces'] text-lg font-semibold text-[#0C0A00] mb-1">
          No unlocked contacts yet
        </h2>
        <p className="text-sm text-[#6B7280] mb-6">
          Unlock contacts from the directory to see them here.
        </p>
        <Link
          href="/directory"
          className="inline-block bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {contacts.map((contact) => (
        <Card
          key={`${contact.type}-${contact.id}`}
          className="border-[#E5E7EB] hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-['Fraunces'] text-base font-medium">
                {contact.name}
              </CardTitle>
              <span className="text-[10px] uppercase tracking-wide text-[#6B7280] bg-[#F5F2EC] px-2 py-0.5 rounded">
                {contact.type}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
              <span className="text-[#1A1D1E] truncate">{contact.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
              <span className="text-[#1A1D1E] truncate">
                {contact.phone || 'Not provided'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}