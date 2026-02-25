import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Nomor HP diperlukan" }, { status: 400 });
  }

  try {
    // Ambil data booking berdasarkan nomor HP, join dengan tabel tracks dan mountains
    const query = `
      SELECT b.*, t.track_name, m.name as mountain_name 
      FROM bookings b
      JOIN tracks t ON b.track_id = t.id
      JOIN mountains m ON t.mountain_id = m.id
      WHERE b.phone_number = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await db.query(query, [phone]);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}