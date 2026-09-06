import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const nid = formData.get('nid') as File;
    const selfie = formData.get('selfie') as File;

    if (!userId) {
      return NextResponse.json({ error: 'UserId required' }, { status: 400 });
    }

    let nidPath: string | null = null;
    let selfiePath: string | null = null;

    // Upload NID
    if (nid) {
      nidPath = `verification/${userId}/nid-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('verification')
        .upload(nidPath, nid, { contentType: nid.type });
      if (error) {
        console.error('NID upload error:', error);
      }
    }

    // Upload Selfie
    if (selfie) {
      selfiePath = `verification/${userId}/selfie-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('verification')
        .upload(selfiePath, selfie, { contentType: selfie.type });
      if (error) {
        console.error('Selfie upload error:', error);
      }
    }

    // Update Author or Publisher record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { author: true, publisher: true },
    });

    if (user?.author) {
      await prisma.author.update({
        where: { userId: userId },
        data: { nidPath, selfiePath },
      });
    }

    if (user?.publisher) {
      await prisma.publisher.update({
        where: { userId: userId },
        data: { nidPath, selfiePath },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}