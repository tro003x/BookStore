import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/footer';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import '@fontsource/fraunces';
import '@fontsource/inter';
import '@fontsource/ibm-plex-mono';

export const metadata: Metadata = {
  title: 'BoiStore',
  description: 'Virtual PDF Bookstore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#EFE9DC] text-[#1A1D1E] min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}