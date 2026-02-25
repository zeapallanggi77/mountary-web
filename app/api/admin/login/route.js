import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 1. Cari admin DAN join ke tabel mountains untuk dapet nama gunungnya
    // Pakai LEFT JOIN biar kalau gunungnya belum ke-set (kasus langka), admin tetap bisa login
    const query = `
      SELECT a.*, m.name as mountain_name 
      FROM admin a
      LEFT JOIN mountains m ON a.mountain_id = m.id
      WHERE a.username = ?
    `;
    
    const [rows] = await db.query(query, [username]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Username Admin tidak ditemukan!" }, { status: 401 });
    }

    const admin = rows[0];

    // 2. BANDINGKAN: Password input VS Password di Database
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      // --- LOGIKA FILTER STATUS ---
      
      // Kalau ditolak (rejected), kita blokir total
      if (admin.status === 'rejected') {
        return NextResponse.json({ 
          error: "Maaf bwang, pendaftaran kamu DITOLAK. Hubungi Admin Pusat untuk info lanjut." 
        }, { status: 403 });
      }

      // 3. Pisahkan password agar tidak ikut terkirim ke frontend
      const { password: _, ...adminData } = admin;

      // 4. Kirim data admin lengkap dengan mountain_name
      return NextResponse.json({ 
        success: true, 
        message: adminData.status === 'pending' 
          ? "Akun sedang diverifikasi..." 
          : "Login Berhasil! Selamat bertugas bwang 🏔️",
        user: {
          id: adminData.id,
          nama_lengkap: adminData.nama_lengkap,
          username: adminData.username,
          email: adminData.email,
          role: adminData.role, // Sekarang otomatis 'admin_gunung' sesuai register baru
          mountain_id: adminData.mountain_id,
          mountain_name: adminData.mountain_name, // DATA BARU: Buat header Dashboard
          status: adminData.status // 'pending' atau 'active'
        }
      });
      
    } else {
      return NextResponse.json({ error: "Password kamu salah bwang!" }, { status: 401 });
    }
  } catch (error) {
    console.error("LOGIN ADMIN ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}