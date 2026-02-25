import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    // 1. Matikan pengecekan Foreign Key (Biar gak dilarang MySQL)
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    
    // 2. Hapus data di tabel 'anak' dulu (booking_members) biar bersih total
    await db.query("TRUNCATE TABLE booking_members");
    
    // 3. Hapus data di tabel 'induk' (bookings)
    await db.query("TRUNCATE TABLE bookings");
    
    // 4. Nyalakan lagi pengecekan Foreign Key (Biar database aman lagi)
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    
    return NextResponse.json({ 
      success: true, 
      message: "BERSIH TOTAL! Data bookings dan members sudah kosong." 
    });
  } catch (error) {
    // Kalau ada error, pastikan pengawasan dinyalakan lagi
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.error("Clear Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}