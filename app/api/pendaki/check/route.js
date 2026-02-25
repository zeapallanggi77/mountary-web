import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kode = searchParams.get("kode");

  try {
    // TAMBAHKAN kolom berat_badan dan tinggi_badan di sini bwang
    const [rows] = await db.query(
      "SELECT nama_lengkap, nik_nisn, jenis_kelamin, berat_badan, tinggi_badan FROM pendaki WHERE kode_pendaki = ?", 
      [kode]
    );

    if (rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        user: rows[0] 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Kode tidak ditemukan" 
      });
    }
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error bwang!" }, 
      { status: 500 }
    );
  }
}