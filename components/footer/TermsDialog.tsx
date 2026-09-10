'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-[#2DD4BF]" />
            <DialogTitle className="font-['Fraunces'] text-xl">
              Terms of Service
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[#6B7280]">
            Rules for using BoiStore.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-sm text-[#1A1D1E]/80 leading-relaxed">
          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">1. Account Responsibility</h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. All activity under your account is your
              responsibility.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">2. Purchases & Access</h3>
            <p>
              Books are sold as PDF-only, read-in-browser content. Purchased
              books are available in your personal library. Downloading or
              redistributing content is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">3. Publisher & Author Conduct</h3>
            <p>
              Publishers and Authors must upload only content they own the
              rights to. Any copyright-infringing material will be removed and
              the account suspended.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">4. Reviews</h3>
            <p>
              Only verified purchasers may leave reviews. Reviews are permanent
              once posted and cannot be edited or removed by the administration.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1A1D1E] mb-1.5">5. Termination</h3>
            <p>
              We reserve the right to suspend or terminate any account that
              violates these terms.
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