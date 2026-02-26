import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";
import { put } from '@vercel/blob'; // Tambahkan ini (Wajib sudah npm install @vercel/blob)

export async function POST(request) {
  try {
    const data = await request.formData();

    // 1. PROSES UPLOAD
    const fileDiterima = data.get("foto_identitas");
    let namaFileUntukDatabase = null;

    if (fileDiterima && typeof fileDiterima !== "string") {
      
      // === JALUR VERCEL (OTOMATIS AKTIF DI ONLINE) ===
      if (process.env.VERCEL) {
        const blob = await put(`identitas-${Date.now()}-${fileDiterima.name}`, fileDiterima, { 
          access: 'public' 
        });
        // Di Vercel, kita simpan URL Full (https://...) ke database
        namaFileUntukDatabase = blob.url;
      } 
      
      // === JALUR LOCALHOST (OTOMATIS AKTIF DI LAPTOP / XAMPP) ===
      else {
        const bytes = await fileDiterima.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        namaFileUntukDatabase = Date.now() + "_identitas_" + fileDiterima.name.replaceAll(" ", "_");
        const filePath = path.join(process.cwd(), "public", "uploads", namaFileUntukDatabase);
        
        await writeFile(filePath, buffer);
        // Di Localhost, kita tetep simpan nama filenya aja (kayak biasa)
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.get("password"), salt);
    const kode_pendaki = `MNT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. QUERY
    const query = `
      INSERT INTO pendaki (
        kode_pendaki, jenis_identitas, nik_nisn, nama_lengkap, tgl_lahir, 
        no_telp, no_darurat, jenis_kelamin, email, berat_badan, 
        tinggi_badan, provinsi, kota, kecamatan, kelurahan, 
        alamat, username, password, foto_ktp, foto_identitas, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const values = [
      kode_pendaki, data.get("jenis_identitas"), data.get("nik_nisn"), data.get("nama_lengkap"), data.get("tgl_lahir"),
      data.get("no_telp"), data.get("no_darurat"), data.get("jenis_kelamin"), data.get("email"), data.get("berat_badan"),
      data.get("tinggi_badan"), data.get("provinsi"), data.get("kota"), data.get("kecamatan"), data.get("kelurahan"),
      data.get("alamat"), data.get("username"), hashedPassword, 
      namaFileUntukDatabase, // Bisa berupa URL Blob (Vercel) atau Nama File (Localhost)
      null,
      'active'
    ];

    await db.query(query, values);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("EROR NYIMPEN:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}