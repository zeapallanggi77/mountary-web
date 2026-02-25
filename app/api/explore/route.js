import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Kita ambil data gunung beserta jalur-jalur yang ada di bawahnya
    const [rows] = await db.query(`
      SELECT m.*, COUNT(t.id) as total_tracks 
      FROM mountains m 
      LEFT JOIN tracks t ON m.id = t.mountain_id 
      GROUP BY m.id
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}