'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function WelcomeToast() {
  const { data: session, status } = useSession();
  const shownRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user?.name) return;
    if (shownRef.current) return;

    // Only show once per browser tab session
    const key = `welcome-shown-${session.user.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) {
      shownRef.current = true;
      return;
    }

    const firstName = session.user.name.split(' ')[0];
    toast.success(`Welcome back, ${firstName}!`, {
      description: 'You are now signed in.',
      duration: 3000,
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, 'true');
    }
    shownRef.current = true;
  }, [session, status]);

  return null;
}