import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Import bcrypt untuk keamanan password

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      email, username, nama_lengkap, no_telp, 
      nik_nisn, alamat, kota, tinggi_badan, 
      berat_badan, foto_identitas,
      new_password // Ambil password baru dari body (jika ada)
    } = body;

    if (!email) {
      return NextResponse.json({ message: "Email mana bwang?" }, { status: 400 });
    }

    // Hash password jika ada password baru yang dikirim
    let hashed_password = null;
    if (new_password && new_password.trim() !== "") {
      hashed_password = await bcrypt.hash(new_password, 10);
    }

    // Query UPDATE tetap pakai COALESCE sesuai kodingan abang
    // Kita selipkan kolom password di sini
    const query = `
      UPDATE pendaki SET 
        username = COALESCE(?, username),
        nama_lengkap = COALESCE(?, nama_lengkap),
        no_telp = COALESCE(?, no_telp),
        nik_nisn = COALESCE(?, nik_nisn),
        alamat = COALESCE(?, alamat),
        kota = COALESCE(?, kota),
        tinggi_badan = COALESCE(?, tinggi_badan),
        berat_badan = COALESCE(?, berat_badan),
        foto_identitas = COALESCE(?, foto_identitas),
        password = COALESCE(?, password) 
      WHERE email = ?
    `;

    const values = [
      username || null,
      nama_lengkap || null,
      no_telp || null,
      nik_nisn || null,
      alamat || null,
      kota || null,
      tinggi_badan || null,
      berat_badan || null,
      foto_identitas || null,
      hashed_password, // Masukkan hasil hash (atau null kalau gak ganti pass)
      email
    ];

    await db.query(query, values);

    return NextResponse.json({ message: "Update Berhasil! ✨" });

  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ 
      message: "Gagal update (mungkin foto terlalu besar atau database error)", 
      error: error.message 
    }, { status: 500 });
  }
}