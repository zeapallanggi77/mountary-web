import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier bisa email atau username

    // 1. Cari pendaki berdasarkan email ATAU username
    const query = `
      SELECT * FROM pendaki 
      WHERE email = ? OR username = ? 
      LIMIT 1
    `;
    
    const [rows] = await db.query(query, [identifier, identifier]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan bwang!" }, 
        { status: 404 }
      );
    }

    const user = rows[0];

    // 2. Bandingkan password yang diinput dengan yang ada di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password salah, coba inget-inget lagi bwang!" }, 
        { status: 401 }
      );
    }

    // 3. Jika berhasil, kirim data user (KECUALI password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" }, 
      { status: 500 }
    );
  }
}