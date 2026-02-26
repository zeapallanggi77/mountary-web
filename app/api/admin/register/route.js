import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";
import { put } from '@vercel/blob'; // Tambahkan ini

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Ambil Data Teks
    const nama_lengkap = formData.get("nama_lengkap");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");
    const mountain_id = formData.get("mountain_id");
    const nama_basecamp = formData.get("nama_basecamp");
    const alamat_basecamp = formData.get("alamat_basecamp");
    const kontak_basecamp = formData.get("kontak_basecamp");
    const lokasi_map = formData.get("lokasi_map");
    const nama_pj = formData.get("nama_pj");
    const nik_pj = formData.get("nik_pj");
    const no_hp_pj = formData.get("no_hp_pj");
    const alasan_pengajuan = formData.get("alasan_pengajuan");

    // Cek duplikasi
    const [existing] = await db.query(
      "SELECT id FROM admin WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Username atau Email sudah terdaftar!" }, { status: 400 });
    }

    // FUNGSI UPLOAD DUA JALUR
    const uploadFile = async (file, prefix) => {
      if (!file || typeof file === "string") return null;

      // JALUR VERCEL
      if (process.env.VERCEL) {
        const blob = await put(`${prefix}-${file.name}`, file, { access: 'public' });
        return blob.url; // Simpan URL Full
      }

      // JALUR LOCALHOST (Aman buat XAMPP)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${prefix}-${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);
      await writeFile(filePath, buffer);
      return fileName;
    };

    const fotoBasecampName = await uploadFile(formData.get("foto_basecamp"), "BC");
    const skPengelolaName = await uploadFile(formData.get("sk_pengelola"), "SK");
    const fotoKtpPjName = await uploadFile(formData.get("foto_ktp_pj"), "KTP");

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO admin (
        nama_lengkap, email, username, password, role, status, mountain_id, track_id,
        nama_basecamp, alamat_basecamp, kontak_basecamp, koordinat_basecamp,
        sk_pengelola, foto_basecamp, nama_pj, nik_pj, foto_ktp_pj, no_hp_pj, alasan_pengajuan
      ) VALUES (?, ?, ?, ?, 'admin_gunung', 'pending', ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_lengkap, email, username, hashedPassword, mountain_id, nama_basecamp, alamat_basecamp, kontak_basecamp, lokasi_map, skPengelolaName, fotoBasecampName, nama_pj, nik_pj, fotoKtpPjName, no_hp_pj, alasan_pengajuan]
    );

    return NextResponse.json({ success: true, message: "Pendaftaran berhasil." });

  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}