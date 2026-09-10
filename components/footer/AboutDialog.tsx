'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-[#2DD4BF]" />
            <DialogTitle className="font-['Fraunces'] text-xl">
              About BoiStore
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[#6B7280]">
            A virtual bookstore for readers and publishers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-[#1A1D1E]/80 leading-relaxed">
          <p>
            BoiStore is a digital-first bookstore where you can discover,
            purchase, and read PDF books instantly — no shipping, no waiting.
          </p>
          <p>
            We connect readers with independent authors and publishers, offering
            full-length previews, in-browser reading, and lifetime access to
            purchased books.
          </p>
          <div className="pt-2 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280]">
              Built with Next.js, Prisma, Supabase & Stripe.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}