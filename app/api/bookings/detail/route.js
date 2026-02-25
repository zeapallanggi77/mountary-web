import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  try {
    // Kita tes tanpa JOIN dulu bwang, biar tau datanya ada atau nggak
    const query = `
      SELECT *, 
      (7200 - TIMESTAMPDIFF(SECOND, created_at, NOW())) as seconds_left 
      FROM bookings 
      WHERE verification_code = ?
    `;

    const [rows] = await db.query(query, [code]);

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    
    // Kalau masih error, kita kasih tau kodenya apa yang dicari
    return NextResponse.json({ 
      error: `Kode ${code} nggak ada di database bwang!` 
    }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}