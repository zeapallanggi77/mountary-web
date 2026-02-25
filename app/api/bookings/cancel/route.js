import { NextResponse } from "next/server";
// Import koneksi DB kamu di sini, contoh:
import { db } from "@/lib/db"

export async function POST(req) {
  try {
    const { booking_id, email } = await req.json();

    if (!booking_id) {
      return NextResponse.json({ message: "ID Booking tidak ditemukan" }, { status: 400 });
    }

    // 1. CEK STATUS TERKINI
    // Pastikan booking tersebut milik user yang login dan statusnya MASIH pending
    // Query contoh (Sesuaikan dengan library DB kamu):
    /* const booking = await db.query(
         "SELECT status FROM bookings WHERE id = ? AND email = ?", 
         [booking_id, email]
       );
    */

    // 2. LOGIKA VALIDASI
    // Jika status sudah 'success' atau 'expired', jangan kasih cancel
    /*
       if (booking.status !== 'pending') {
         return NextResponse.json({ message: "Hanya booking pending yang bisa dibatalkan" }, { status: 400 });
       }
    */

    // 3. UPDATE STATUS JADI CANCELLED
    /*
       await db.query(
         "UPDATE bookings SET status = 'cancelled' WHERE id = ?", 
         [booking_id]
       );
    */

    // 4. (OPSIONAL) KEMBALIKAN KUOTA
    // Jika saat booking kamu sudah memotong kuota gunung, di sini kamu tambahkan lagi (+1)
    /*
       await db.query(
         "UPDATE mountains SET quota = quota + 1 WHERE id = (SELECT mountain_id FROM bookings WHERE id = ?)",
         [booking_id]
       );
    */

    return NextResponse.json({ 
      message: "Booking berhasil dibatalkan bwang! 🏔️",
      status: "cancelled" 
    }, { status: 200 });

  } catch (error) {
    console.error("Error Cancel Booking:", error);
    return NextResponse.json({ message: "Gagal memproses pembatalan" }, { status: 500 });
  }
}