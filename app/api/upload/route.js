import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) return NextResponse.json({ success: false });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Tentukan lokasi folder public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // 2. CEK OTOMATIS: Jika folder belum ada, buatkan sekarang juga
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, filename);
    
    // 3. Simpan file
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Gagal Upload:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}