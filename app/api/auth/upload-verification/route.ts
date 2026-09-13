import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const nid = formData.get('nid') as File | null;
    const selfie = formData.get('selfie') as File | null;
    const cv = formData.get('cv') as File | null;
    const certificate = formData.get('certificate') as File | null;

    if (!userId) {
      return NextResponse.json({ error: 'UserId required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { author: true, publisher: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const uploadFile = async (
      file: File,
      folder: string,
      ext: string
    ): Promise<string | null> => {
      if (!file || file.size === 0) return null;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `verification/${userId}/${folder}-${Date.now()}-${safeName}${ext}`;
      const { error } = await supabase.storage
        .from('verification')
        .upload(path, file, { contentType: file.type });
      if (error) {
        console.error(`${folder} upload error:`, error);
        return null;
      }
      return path;
    };

    // Upload files
    const nidPath = nid ? await uploadFile(nid, 'nid', '') : null;
    const selfiePath = selfie ? await uploadFile(selfie, 'selfie', '') : null;
    const cvPath = cv ? await uploadFile(cv, 'cv', '') : null;
    const certificatePath = certificate
      ? await uploadFile(certificate, 'certificate', '')
      : null;

    // Update AUTHOR record
    if (user.author) {
      await prisma.author.update({
        where: { userId },
        data: {
          ...(nidPath && { nidPath }),
          ...(selfiePath && { selfiePath }),
          ...(cvPath && { cvPath }),
          ...(certificatePath && { certificatePath }),
        },
      });
    }

    // Update PUBLISHER record
    if (user.publisher) {
      await prisma.publisher.update({
        where: { userId },
        data: {
          ...(nidPath && { nidPath }),
          ...(selfiePath && { selfiePath }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Upload verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}