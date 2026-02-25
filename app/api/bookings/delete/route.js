import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    // 1. Matikan pengecekan Foreign Key sebentar
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    
    // 2. Hapus dari tabel members dulu (jika ada) baru tabel bookings
    await db.query("DELETE FROM booking_members WHERE booking_id = ?", [id]);
    await db.query("DELETE FROM bookings WHERE id = ?", [id]);
    
    // 3. Nyalakan lagi
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    return NextResponse.json({ success: true, message: "Data pendaki berhasil dihapus!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}