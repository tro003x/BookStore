'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Fraunces'] text-xl">
            Contact Us
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6B7280]">
            We'd love to hear from you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <a
            href="mailto:oritrobinislam@gmail.com"
            className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F6F7] transition-colors"
          >
            <Mail className="h-5 w-5 text-[#2DD4BF] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1A1D1E]">Email</p>
              <p className="text-sm text-[#6B7280]">oritrobinislam@gmail.com</p>
            </div>
          </a>

          <a
            href="mailto:support@boistore.com"
            className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F6F7] transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-[#2DD4BF] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1A1D1E]">Support</p>
              <p className="text-sm text-[#6B7280]">support@boistore.com</p>
            </div>
          </a>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB]">
            <MapPin className="h-5 w-5 text-[#2DD4BF] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1A1D1E]">Location</p>
              <p className="text-sm text-[#6B7280]">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}