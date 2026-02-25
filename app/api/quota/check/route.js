import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track_id = searchParams.get("track_id");
    const date = searchParams.get("date");

    if (!track_id || !date) {
      return NextResponse.json({ error: "Parameter track_id dan date wajib ada bwang" }, { status: 400 });
    }

    // 1. Ambil Kapasitas Maksimal Jalur
    const [trackRows] = await db.query(
      "SELECT quota_weekday, quota_weekend FROM tracks WHERE id = ?",
      [track_id]
    );

    if (trackRows.length === 0) {
      return NextResponse.json({ error: "Jalur tidak ditemukan" }, { status: 404 });
    }

    // Logika Weekend (Sabtu=6, Minggu=0)
    const day = new Date(date).getDay();
    const isWeekend = (day === 6 || day === 0);
    const maxQuota = isWeekend ? trackRows[0].quota_weekend : trackRows[0].quota_weekday;

    // 2. Hitung jumlah yang SUDAH booking
    // Note: Sesuaikan status 'CANCELED' (huruf besar) sesuai konsistensi di DB kamu
   const [bookingRows] = await db.query(
  `SELECT SUM(total_members) as terisi 
   FROM bookings 
   WHERE track_id = ? 
   AND booking_date = ? 
   AND status NOT IN ('CANCELED', 'EXPIRED', 'REJECTED', 'FINISHED')`, // FINISHED ditambahkan di sini
  [track_id, date]
);

    // Pastikan terisi adalah angka (number)
    const terisi = Number(bookingRows[0].terisi) || 0;
    const sisa = maxQuota - terisi;

    return NextResponse.json({
      success: true,
      sisa_kuota: Math.max(0, sisa), // Biar sisa nggak pernah minus di UI
      kuota_max: maxQuota,
      terisi: terisi
    });

  } catch (error) {
    console.error("DATABASE ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Gagal cek kuota bwang: " + error.message 
    }, { status: 500 });
  }
}