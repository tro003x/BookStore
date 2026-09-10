'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-[#2DD4BF]" />
            <DialogTitle className="font-['Fraunces'] text-xl">
              Privacy Policy
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[#6B7280]">
            How we collect, use, and protect your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-sm text-[#1A1D1E]/80 leading-relaxed">
          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">1. Information We Collect</h3>
            <p>
              We collect your name, email address, and account credentials when
              you sign up. For Authors and Publishers, we also collect
              verification documents (NID and selfie) to confirm identity.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">2. How We Use Your Data</h3>
            <p>
              Your information is used strictly to operate the platform:
              authenticating you, processing book purchases through Stripe, and
              enabling in-browser reading of purchased content.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">3. Payments</h3>
            <p>
              All payments are processed by Stripe. We never store your raw card
              details — only the transaction ID, status, and amount.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">4. Data Sharing</h3>
            <p>
              We do not sell your data. Contact details for Authors and
              Publishers are only revealed to users who unlock them via a
              one-time payment.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">5. Your Rights</h3>
            <p>
              You may request deletion of your account and data at any time by
              contacting us at <span className="text-[#2DD4BF]">oritrobinislam@gmail.com</span>.
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