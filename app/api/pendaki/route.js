import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Ambil ID dari URL (untuk halaman Detail Biodata)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // JIKA ADA ID: Tarik detail satu orang saja
      // Kolom disesuaikan dengan PDF kamu: nik_nisn, kode_pendaki, dll.
      const [rows] = await db.query("SELECT * FROM pendaki WHERE id = ?", [id]);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "Pendaki tidak ditemukan" }, { status: 404 });
      }
      
      return NextResponse.json(rows[0]);
    }

    // JIKA TIDAK ADA ID: Tarik semua pendaki untuk tabel di Dashboard
    // Query ini akan narik nik_nisn, nama_lengkap, status_mendaki sesuai PDF
    const [rows] = await db.query("SELECT * FROM pendaki ORDER BY id DESC");

    console.log("Data Pendaki Berhasil Ditarik:", rows.length);
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error("ERROR_PENDAKI_API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}