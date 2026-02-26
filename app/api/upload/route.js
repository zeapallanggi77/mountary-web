import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { put } from '@vercel/blob'; // Tambahkan ini

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) return NextResponse.json({ success: false });

    // JALUR VERCEL (Jika terdeteksi di server Vercel)
    if (process.env.VERCEL) {
      const blob = await put(file.name, file, { access: 'public' });
      return NextResponse.json({ success: true, url: blob.url });
    }

    // JALUR LOCALHOST (XAMPP tetap aman di sini)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Gagal Upload:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}