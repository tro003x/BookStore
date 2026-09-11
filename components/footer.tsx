'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import AboutDialog from './footer/AboutDialog';
import ContactDialog from './footer/ContactDialog';
import PrivacyDialog from './footer/PrivacyDialog';
import TermsDialog from './footer/TermsDialog';
import CookieDialog from './footer/CookieDialog';

export default function Footer() {
  const pathname = usePathname();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [cookieOpen, setCookieOpen] = useState(false);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="flex-shrink-0 bg-[#1A1D1E] text-[#F5F2EC]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand + Made by */}
            <div className="md:col-span-1">
              <h3 className="font-['Fraunces'] text-2xl font-semibold text-white mb-3">
                BoiStore
              </h3>
              <p className="text-sm text-[#F5F2EC]/70 max-w-xs mb-5">
                Discover, read, and buy PDF books instantly.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs text-[#F5F2EC]/60">Made by</span>
                <a
                  href="https://github.com/tro003x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#14B8A6] hover:text-[#14B8A6]/80 transition-colors"
                >
                  Tro003x
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EC]/50 mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setAboutOpen(true)}
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <Link
                    href="/catalog"
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/directory"
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Directory
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EC]/50 mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCookieOpen(true)}
                    className="text-sm text-[#F5F2EC]/75 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EC]/50 mb-4">
                Follow Us
              </h4>
              <div className="flex gap-2.5">
                {/* GitHub */}
                <a
                  href="https://github.com/tro003x"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#14B8A6]/15 hover:text-[#14B8A6] transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/tro003x"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#14B8A6]/15 hover:text-[#14B8A6] transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.729C24 .774 23.204 0 22.222 0h.003z" />
                  </svg>
                </a>

                {/* X */}
                <a
                  href="https://x.com/tro003x"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#14B8A6]/15 hover:text-[#14B8A6] transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Email */}
                <a
                  href="mailto:oritrobinislam@gmail.com"
                  aria-label="Email"
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#14B8A6]/15 hover:text-[#14B8A6] transition-all"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-[#F5F2EC]/50">
              &copy; {currentYear} BoiStore. All rights reserved.
            </p>
            <p className="text-xs text-[#F5F2EC]/40">
              Built with Next.js, Prisma & Supabase
            </p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <CookieDialog open={cookieOpen} onOpenChange={setCookieOpen} />
    </>
  );
}