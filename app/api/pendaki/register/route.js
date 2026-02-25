import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.formData();

    // 1. PROSES UPLOAD
    const fileDiterima = data.get("foto_identitas");
    let namaFileUntukDatabase = null;

    if (fileDiterima && typeof fileDiterima !== "string") {
      const bytes = await fileDiterima.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Bikin nama file persis kayak di log abang
      namaFileUntukDatabase = Date.now() + "_identitas_" + fileDiterima.name.replaceAll(" ", "_");
      
      // DISINI KUNCINYA: Simpan LANGSUNG di folder 'public', 
      // JANGAN masukin ke folder 'uploads' kalau di Page Admin abang manggilnya langsung "/"
      const publicPath = path.join(process.cwd(), "public");
      
      // Cek apakah folder public ada (pasti ada sih), lalu tulis file
      const filePath = path.join(process.cwd(), "public", "uploads", namaFileUntukDatabase);
await writeFile(filePath, buffer);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.get("password"), salt);
    const kode_pendaki = `MNT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. QUERY (File masuk ke foto_ktp sesuai kemauan abang)
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
      namaFileUntukDatabase, // Masuk ke foto_ktp (Lampiran)
      null,                  // Masuk ke foto_identitas (Profil)
      'active'
    ];

    await db.query(query, values);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("EROR NYIMPEN:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}