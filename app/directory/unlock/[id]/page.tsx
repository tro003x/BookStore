'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Phone, ArrowLeft, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  user: { email: string };
  phone?: string;
}

export default function UnlockPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const type = (searchParams.get('type') || 'author') as 'author' | 'publisher';
  const paid = searchParams.get('paid') === 'true';
  const sessionIdParam = searchParams.get('session_id');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  /* ---------- FETCH PROFILE + CHECK UNLOCK ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`/api/directory/profile?id=${id}&type=${type}`);
        if (!profileRes.ok) {
          setLoading(false);
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        if (session?.user?.id) {
          const unlocksRes = await fetch('/api/directory/my-unlocks');
          const unlocksData = await unlocksRes.json();

          const ownId =
            type === 'author' ? unlocksData.myAuthorId : unlocksData.myPublisherId;

          if (ownId === id) {
            setIsOwnProfile(true);
            setAlreadyUnlocked(true);
          } else if (
            unlocksData.unlocks?.some(
              (u: { profileId: string; profileType: string }) =>
                u.profileId === id && u.profileType === type.toUpperCase()
            )
          ) {
            setAlreadyUnlocked(true);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (status !== 'loading') fetchData();
  }, [id, type, session, status]);

  /* ---------- CONFIRM UNLOCK AFTER PAYMENT ---------- */
  useEffect(() => {
    if (!paid || !session?.user?.id || !sessionIdParam) return;
    if (alreadyUnlocked) return;

    const confirm = async () => {
      try {
        const res = await fetch('/api/directory/confirm-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionIdParam }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAlreadyUnlocked(true);
          toast.success('Contact unlocked!');
        } else {
          toast.error(data.error || 'Failed to confirm unlock');
        }
      } catch (error) {
        console.error('Confirm error:', error);
      }
    };
    confirm();
  }, [paid, session, sessionIdParam, alreadyUnlocked]);

  /* ---------- CREATE STRIPE SESSION (only when allowed) ---------- */
  const canUnlock =
    session?.user?.role === 'AUTHOR' || session?.user?.role === 'PUBLISHER';

  useEffect(() => {
    if (paid || alreadyUnlocked) return;
    if (!session?.user?.id) return;
    if (!canUnlock) return;
    if (isOwnProfile) return;

    const createSession = async () => {
      try {
        const res = await fetch('/api/directory/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, type }),
        });
        const data = await res.json();
        if (data.url) setSessionUrl(data.url);
      } catch (error) {
        console.error('Create session error:', error);
      }
    };
    createSession();
  }, [id, type, paid, alreadyUnlocked, session, canUnlock, isOwnProfile]);

  const handlePay = () => {
    if (!sessionUrl) return;
    setRedirecting(true);
    window.location.href = sessionUrl;
  };

  /* ---------- RENDER STATES ---------- */

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-[#6B7280] mb-4">Profile not found.</p>
            <Link href="/directory">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Show contact info if unlocked OR own profile */
  if (alreadyUnlocked) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-['Fraunces'] text-2xl">
                {profile.name}
              </CardTitle>
              {isOwnProfile && (
                <span className="text-xs font-medium text-[#0D9488] bg-[#14B8A6]/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> You
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F2EC]">
              <Mail className="h-4 w-4 text-[#14B8A6]" />
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">Email</p>
                <p className="text-sm text-[#1A1D1E] truncate">
                  {profile.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F2EC]">
              <Phone className="h-4 w-4 text-[#14B8A6]" />
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">Phone</p>
                <p className="text-sm text-[#1A1D1E] truncate">
                  {profile.phone || 'Not provided'}
                </p>
              </div>
            </div>

            {isOwnProfile ? (
              <Link
                href={
                  type === 'author' ? '/dashboard/author' : '/dashboard/publisher'
                }
              >
                <Button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white">
                  Go to My Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/directory">
                <Button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Not logged in */
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E5E7EB]">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#14B8A6]/10 mb-4">
              <LogIn className="h-6 w-6 text-[#14B8A6]" />
            </div>
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-2">
              Login Required
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              You need to log in to unlock contact details.
            </p>
            <Link href="/login">
              <Button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white">
                <LogIn className="h-4 w-4 mr-2" /> Log In
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" className="w-full mt-2">
                Back to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Reader cannot unlock */
  if (!canUnlock) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#E5E7EB]">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#DC2626]/10 mb-4">
              <AlertCircle className="h-6 w-6 text-[#DC2626]" />
            </div>
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-2">
              Not Available
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Only Authors and Publishers can unlock contact details. Readers
              can browse the directory but cannot purchase unlocks.
            </p>
            <Link href="/directory">
              <Button variant="outline" className="w-full">
                Back to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Author/Publisher: show pay button */
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="font-['Fraunces'] text-2xl">
            {profile.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F2EC] mb-5">
            <Lock className="h-4 w-4 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">
              Contact details are hidden.
            </p>
          </div>

          <p className="text-sm text-[#6B7280] mb-4">
            Pay <strong className="text-[#A85C32]">$5.00</strong> to reveal
            email and phone.
          </p>

          <Button
            onClick={handlePay}
            disabled={!sessionUrl || redirecting}
            className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white h-11 font-medium disabled:opacity-50"
          >
            {redirecting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Redirecting...
              </span>
            ) : sessionUrl ? (
              'Unlock Contact · $5.00'
            ) : (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Preparing...
              </span>
            )}
          </Button>

          <Link href="/directory">
            <Button variant="outline" className="w-full mt-2">
              Cancel
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}