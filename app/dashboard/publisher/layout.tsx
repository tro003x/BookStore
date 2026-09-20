import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Clock } from 'lucide-react';

export default async function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { publisher: true },
  });

  if (!user?.publisher) redirect('/');

  // Block unverified publishers
  if (user.publisher.verificationStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#F59E0B]/10 mb-5">
            <Clock className="h-8 w-8 text-[#F59E0B]" />
          </div>
          <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
            Account Under Review
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">
            {user.publisher.verificationStatus === 'REJECTED'
              ? 'Your verification was rejected. Please contact support.'
              : 'Your publisher account is pending admin approval. You will receive an email once verified.'}
          </p>
          <a
            href="/"
            className="inline-block bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Store
          </a>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}