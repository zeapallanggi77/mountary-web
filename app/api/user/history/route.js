import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  try {
    // Pastikan nama kolom 'email' ada di tabel bookings kamu
    const [rows] = await db.query(
      "SELECT * FROM bookings WHERE email = ? ORDER BY id DESC",
      [email]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}