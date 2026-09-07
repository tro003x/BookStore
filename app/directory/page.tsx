'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function DirectoryPage() {
  const { data: session } = useSession();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set());

  // Fetch directory data
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

  // Fetch user's unlocks
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnlocks = async () => {
      try {
        const res = await fetch('/api/directory/my-unlocks');
        const data = await res.json();
        const set = new Set<string>();
        (data.unlocks || []).forEach((unlock: Unlock) => {
          set.add(`${unlock.profileType}:${unlock.profileId}`);
        });
        setUnlockedSet(set);
      } catch (error) {
        console.error('Unlocks fetch error:', error);
      }
    };
    fetchUnlocks();
  }, [session]);

  const isUnlocked = (profileId: string, profileType: string) => {
    return unlockedSet.has(`${profileType.toUpperCase()}:${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE9DC] p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">Directory</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authors */}
          <div>
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-4">Authors</h2>
            {authors.length === 0 ? (
              <p className="text-gray-500">No approved authors yet.</p>
            ) : (
              <div className="space-y-3">
                {authors.map((author) => {
                  const unlocked = isUnlocked(author.id, 'AUTHOR');
                  return (
                    <Card key={author.id} className="bg-white">
                      <CardHeader>
                        <CardTitle className="font-['Fraunces'] text-lg">
                          {author.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{author.bio || 'No bio available'}</p>
                        {unlocked ? (
                          <div className="mt-3">
                            <Link href={`/directory/unlock/${author.id}?type=author&paid=true`}>
                              <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                                See Details
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <Link href={`/directory/unlock/${author.id}?type=author`}>
                              <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                                Unlock Contact
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Publishers */}
          <div>
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-4">Publishers</h2>
            {publishers.length === 0 ? (
              <p className="text-gray-500">No approved publishers yet.</p>
            ) : (
              <div className="space-y-3">
                {publishers.map((publisher) => {
                  const unlocked = isUnlocked(publisher.id, 'PUBLISHER');
                  return (
                    <Card key={publisher.id} className="bg-white">
                      <CardHeader>
                        <CardTitle className="font-['Fraunces'] text-lg">
                          {publisher.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">Publisher</p>
                        {unlocked ? (
                          <div className="mt-3">
                            <Link href={`/directory/unlock/${publisher.id}?type=publisher&paid=true`}>
                              <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                                See Details
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <Link href={`/directory/unlock/${publisher.id}?type=publisher`}>
                              <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                                Unlock Contact
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}