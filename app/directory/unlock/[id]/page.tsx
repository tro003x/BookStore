'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  user: { email: string };
  phone?: string;
}

export default function UnlockPage() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const type = searchParams.get('type') || 'author';
  const paid = searchParams.get('paid') === 'true';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  // Fetch profile + check unlock status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`/api/directory/profile?id=${id}&type=${type}`);
        const profileData = await profileRes.json();
        setProfile(profileData);

        if (session?.user?.id) {
          const unlockRes = await fetch(`/api/directory/check-unlock?profileId=${id}&profileType=${type.toUpperCase()}`);
          const unlockData = await unlockRes.json();
          if (unlockData.unlocked) {
            setAlreadyUnlocked(true);
          }
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type, session]);

  // Create Stripe session if not paid and not already unlocked
  useEffect(() => {
    if (paid || alreadyUnlocked) {
      return;
    }
    const createSession = async () => {
      const res = await fetch('/api/directory/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (data.url) {
        setSessionUrl(data.url);
      }
    };
    createSession();
  }, [id, type, paid, alreadyUnlocked]);

  // Confirm payment and create unlock record
  useEffect(() => {
    if (paid && session?.user?.id) {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        fetch('/api/directory/confirm-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log('Unlock record created');
            } else {
              console.error('Unlock failed:', data.error);
            }
          })
          .catch((err) => {
            console.error('Unlock error:', err);
          });
      }
    }
  }, [paid, session, searchParams]);

  const handlePay = () => {
    if (sessionUrl) {
      window.location.href = sessionUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE9DC] p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#EFE9DC] p-6 flex items-center justify-center">
        <p>Profile not found.</p>
      </div>
    );
  }

  // Show contact info if already unlocked OR just paid
  if (alreadyUnlocked || paid) {
    return (
      <div className="min-h-screen bg-[#EFE9DC] p-6">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="font-['Fraunces'] text-2xl">
                {profile.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Email:</strong> {profile.user.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone || 'Not provided'}
              </p>
              <Link href="/directory">
                <Button className="mt-4 bg-[#4B5D45] text-white hover:opacity-90">
                  Back to Directory
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-['Fraunces'] text-2xl">
              {profile.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Pay $5.00 to reveal contact information.
            </p>
            <Button
              onClick={handlePay}
              className="w-full bg-[#4B5D45] text-white hover:opacity-90"
              disabled={!sessionUrl}
            >
              {sessionUrl ? 'Pay to Unlock ($5.00)' : 'Loading...'}
            </Button>
            <Link href="/directory">
              <Button variant="outline" className="w-full mt-2">
                Cancel
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}