'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Cookie } from 'lucide-react';

interface CookieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CookieDialog({ open, onOpenChange }: CookieDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Cookie className="h-5 w-5 text-[#2DD4BF]" />
            <DialogTitle className="font-['Fraunces'] text-xl">
              Cookie Policy
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[#6B7280]">
            How we use cookies and similar technologies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-sm text-[#1A1D1E]/80 leading-relaxed">
          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">1. What Are Cookies</h3>
            <p>
              Cookies are small text files stored on your device that help
              websites remember information about your visit.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">2. How We Use Cookies</h3>
            <p>
              We use essential cookies to keep you signed in, to remember your
              cart contents, and to securely process Stripe checkout sessions.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">3. Third-Party Cookies</h3>
            <p>
              Stripe may set cookies during the payment process to prevent fraud.
              These are governed by Stripe's own privacy policy.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">4. Managing Cookies</h3>
            <p>
              You can disable cookies in your browser settings. However, some
              features (login, cart, checkout) may not work without them.
            </p>
          </section>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280]">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}