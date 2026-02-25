import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Import bcrypt

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 1. Cari user berdasarkan username saja
    const [rows] = await db.query("SELECT * FROM pendaki WHERE username = ?", [username]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Username tidak ditemukan!" }, { status: 401 });
    }

    const user = rows[0];

    // --- PENGETATAN KEAMANAN: CEK STATUS SUSPEND ---
    if (user.status === 'suspended') {
      return NextResponse.json({ 
        error: "AKUN DITANGGUHKAN! Akun abang sedang di-suspend oleh admin. Silakan hubungi Admin Mountary bwang." 
      }, { status: 403 });
    }
    // -----------------------------------------------

    // 2. Bandingkan password inputan dengan password terenkripsi di DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Hilangkan password dari objek user sebelum dikirim ke frontend biar aman
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    } else {
      return NextResponse.json({ error: "Password salah bwang!" }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}