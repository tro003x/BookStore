import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DirectoryPage() {
  const authors = await prisma.author.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: { user: { select: { name: true, email: true } } },
  });

  const publishers = await prisma.publisher.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: { user: { select: { name: true, email: true } } },
  });

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
                {authors.map((author) => (
                  <Card key={author.id} className="bg-white">
                    <CardHeader>
                      <CardTitle className="font-['Fraunces'] text-lg">
                        {author.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{author.bio || 'No bio available'}</p>
                      <div className="mt-3">
                        <Link href={`/directory/unlock/${author.id}?type=author`}>
                          <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                            Unlock Contact
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                {publishers.map((publisher) => (
                  <Card key={publisher.id} className="bg-white">
                    <CardHeader>
                      <CardTitle className="font-['Fraunces'] text-lg">
                        {publisher.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Publisher</p>
                      <div className="mt-3">
                        <Link href={`/directory/unlock/${publisher.id}?type=publisher`}>
                          <Button className="bg-[#4B5D45] text-white hover:opacity-90">
                            Unlock Contact
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}