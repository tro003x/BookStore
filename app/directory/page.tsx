'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Search,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  Users,
  BookOpen,
  UserCircle2,
  MessageSquare,
} from 'lucide-react';

interface Author {
  id: string;
  name: string;
  bio: string | null;
  user: { email: string; name: string };
  phone: string | null;
}

interface Publisher {
  id: string;
  name: string;
  user: { email: string; name: string };
  phone: string | null;
}

interface Unlock {
  profileId: string;
  profileType: string;
}

type FilterType = 'all' | 'authors' | 'publishers';

export default function DirectoryPage() {
  const { data: session } = useSession();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set());
  const [myAuthorId, setMyAuthorId] = useState<string | null>(null);
  const [myPublisherId, setMyPublisherId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const res = await fetch('/api/directory');
        const data = await res.json();
        setAuthors(data.authors || []);
        setPublishers(data.publishers || []);
      } catch (error) {
        console.error('Directory fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnlocks = async () => {
      try {
        const res = await fetch('/api/directory/my-unlocks');
        const data = await res.json();
        const set = new Set<string>();
        (data.unlocks || []).forEach((u: Unlock) => {
          set.add(`${u.profileType}:${u.profileId}`);
        });
        setUnlockedSet(set);
        setMyAuthorId(data.myAuthorId || null);
        setMyPublisherId(data.myPublisherId || null);
      } catch (error) {
        console.error('Unlocks fetch error:', error);
      }
    };
    fetchUnlocks();
  }, [session]);

  const isUnlocked = (profileId: string, profileType: string) =>
    unlockedSet.has(`${profileType.toUpperCase()}:${profileId}`);

  const isOwnProfile = (
    profileId: string,
    profileType: 'AUTHOR' | 'PUBLISHER'
  ) => {
    if (profileType === 'AUTHOR') return myAuthorId === profileId;
    if (profileType === 'PUBLISHER') return myPublisherId === profileId;
    return false;
  };

  const initials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredAuthors = useMemo(() => {
    if (filter === 'publishers') return [];
    if (!search.trim()) return authors;
    const q = search.toLowerCase();
    return authors.filter(
      (a) => a.name.toLowerCase().includes(q) || a.bio?.toLowerCase().includes(q)
    );
  }, [authors, search, filter]);

  const filteredPublishers = useMemo(() => {
    if (filter === 'authors') return [];
    if (!search.trim()) return publishers;
    const q = search.toLowerCase();
    return publishers.filter((p) => p.name.toLowerCase().includes(q));
  }, [publishers, search, filter]);

  const totalResults = filteredAuthors.length + filteredPublishers.length;

  return (
    <div className="min-h-screen bg-[#F5F2EC] py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="font-['Fraunces'] text-4xl font-semibold text-[#1A1D1E] mb-2">
            Directory
          </h1>
          <p className="text-base text-[#6B7280] max-w-xl mx-auto">
            Connect with verified authors and publishers. Unlock contact details
            with a one-time fee.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6] transition"
            />
          </div>

          <div className="flex justify-center gap-2">
            {[
              { key: 'all' as const, label: 'All', icon: UserCircle2 },
              { key: 'authors' as const, label: 'Authors', icon: BookOpen },
              { key: 'publishers' as const, label: 'Publishers', icon: Users },
            ].map((t) => {
              const Icon = t.icon;
              const active = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#1A1D1E] text-white'
                      : 'bg-white text-[#1A1D1E] border border-[#E5E7EB] hover:bg-[#F5F2EC]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {!loading && (
          <p className="text-center text-sm text-[#6B7280] mb-6">
            {totalResults} {totalResults === 1 ? 'profile' : 'profiles'} found
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
              <p className="text-sm text-[#6B7280]">Loading directory...</p>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#F5F2EC] mb-4">
              <Search className="h-7 w-7 text-[#6B7280]" />
            </div>
            <h2 className="font-['Fraunces'] text-lg font-semibold text-[#1A1D1E] mb-1">
              No profiles found
            </h2>
            <p className="text-sm text-[#6B7280]">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredAuthors.length > 0 && (
              <div>
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-[#14B8A6]" />
                    </div>
                    <h2 className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E]">
                      Authors
                    </h2>
                    <span className="text-sm text-[#6B7280]">
                      ({filteredAuthors.length})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAuthors.map((author) => {
                    const own = isOwnProfile(author.id, 'AUTHOR');
                    const unlocked = isUnlocked(author.id, 'AUTHOR') || own;
                    return (
                      <ProfileCard
                        key={author.id}
                        name={author.name}
                        subtitle={author.bio || 'Author'}
                        initials={initials(author.name)}
                        type="author"
                        id={author.id}
                        unlocked={unlocked}
                        isOwn={own}
                        email={author.user.email}
                        phone={author.phone}
                        accent="teal"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {filteredPublishers.length > 0 && (
              <div>
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-full bg-[#A85C32]/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#A85C32]" />
                    </div>
                    <h2 className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E]">
                      Publishers
                    </h2>
                    <span className="text-sm text-[#6B7280]">
                      ({filteredPublishers.length})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPublishers.map((publisher) => {
                    const own = isOwnProfile(publisher.id, 'PUBLISHER');
                    const unlocked = isUnlocked(publisher.id, 'PUBLISHER') || own;
                    return (
                      <ProfileCard
                        key={publisher.id}
                        name={publisher.name}
                        subtitle="Publisher"
                        initials={initials(publisher.name)}
                        type="publisher"
                        id={publisher.id}
                        unlocked={unlocked}
                        isOwn={own}
                        email={publisher.user.email}
                        phone={publisher.phone}
                        accent="amber"
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  name: string;
  subtitle: string;
  initials: string;
  type: 'author' | 'publisher';
  id: string;
  unlocked: boolean;
  isOwn: boolean;
  email: string;
  phone: string | null;
  accent: 'teal' | 'amber';
}

function ProfileCard({
  name,
  subtitle,
  initials,
  type,
  id,
  unlocked,
  isOwn,
  email,
  phone,
  accent,
}: ProfileCardProps) {
  const accentBg = accent === 'teal' ? 'bg-[#14B8A6]/10' : 'bg-[#A85C32]/10';
  const accentText = accent === 'teal' ? 'text-[#0D9488]' : 'text-[#A85C32]';

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`h-14 w-14 rounded-full ${accentBg} ${accentText} flex items-center justify-center text-lg font-semibold shrink-0`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-['Fraunces'] text-base font-semibold text-[#1A1D1E] truncate">
            {name}
          </h3>
          <p className="text-xs text-[#6B7280] uppercase tracking-wide">
            {type}
          </p>
        </div>
      </div>

      <p className="text-sm text-[#6B7280] line-clamp-2 mb-5 min-h-[2.5rem]">
        {subtitle}
      </p>

      <div className="mt-auto space-y-2">
        {isOwn ? (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#14B8A6]/10 self-start">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">
                This is you
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#1A1D1E]">
                <Mail className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#1A1D1E]">
                <Phone className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
                <span className="truncate">{phone || 'Not provided'}</span>
              </div>
            </div>
            <Link
              href={type === 'author' ? '/dashboard/author' : '/dashboard/publisher'}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full border-[#E5E7EB] text-[#1A1D1E] hover:bg-[#F5F2EC] h-10 text-sm"
              >
                Go to Dashboard
              </Button>
            </Link>
          </>
        ) : unlocked ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#1A1D1E]">
                <Mail className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#1A1D1E]">
                <Phone className="h-3.5 w-3.5 text-[#6B7280] shrink-0" />
                <span className="truncate">{phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#16A34A] uppercase tracking-wide font-medium pt-1">
                <CheckCircle2 className="h-3 w-3" /> Unlocked
              </div>
            </div>
            <MessageButton profileId={id} profileType={type} />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Lock className="h-3.5 w-3.5" />
              <span>Contact hidden</span>
            </div>
            <Link href={`/directory/unlock/${id}?type=${type}`} className="block">
              <Button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white h-10 text-sm font-medium">
                Unlock Contact · $5
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function MessageButton({
  profileId,
  profileType,
}: {
  profileId: string;
  profileType: 'author' | 'publisher';
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const role = session?.user?.role;
  if (role !== 'AUTHOR' && role !== 'PUBLISHER' && role !== 'ADMIN') {
    return null;
  }

  const goToMessages = () => {
    const base =
      role === 'ADMIN'
        ? '/dashboard/admin/messages'
        : role === 'AUTHOR'
        ? '/dashboard/author/messages'
        : '/dashboard/publisher/messages';
    router.push(`${base}?userId=${profileId}`);
  };

  return (
    <Button
      onClick={goToMessages}
      variant="outline"
      className="w-full border-[#E5E7EB] text-[#1A1D1E] hover:bg-[#F5F2EC] h-10 text-sm"
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Message
    </Button>
  );
}