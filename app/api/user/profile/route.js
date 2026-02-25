import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // 1. Validasi input email
  if (!email) {
    return NextResponse.json({ error: "Email diperlukan bwang!" }, { status: 400 });
  }

  try {
    // 2. AUTO-DELETE: Bersihkan booking pending yang sudah lewat 2 jam
    // Ini biar kuota balik otomatis dan list riwayat bersih dari data hangus
    await db.query(`
      DELETE FROM bookings 
      WHERE status = 'pending' 
      AND created_at < NOW() - INTERVAL 2 HOUR
    `);

    // 3. AMBIL PROFIL: Ambil data user pendaki berdasarkan email
    const [userRows] = await db.query("SELECT * FROM pendaki WHERE email = ?", [email]);
    
    // 4. AMBIL RIWAYAT: Ambil data booking, gabung dengan tabel track dan gunung
    const [historyRows] = await db.query(`
      SELECT b.*, t.track_name, m.name as mountain_name 
      FROM bookings b
      JOIN tracks t ON b.track_id = t.id
      JOIN mountains m ON t.mountain_id = m.id
      WHERE b.email = ?
      ORDER BY b.created_at DESC
    `, [email]);

    // 5. RESPONSE: Kirim data dalam format JSON
    return NextResponse.json({ 
      user: userRows.length > 0 ? userRows[0] : null, 
      history: historyRows || [] 
    });

  } catch (error) {
    console.error("DATABASE_ERROR_PROFILE:", error);
    // Kirim JSON error supaya frontend tidak kena 'Unexpected end of JSON input'
    return NextResponse.json({ 
      error: "Terjadi kesalahan server", 
      message: error.message 
    }, { status: 500 });
  }
}