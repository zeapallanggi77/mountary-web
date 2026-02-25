import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// --- AMBIL DATA JALUR (DENGAN FILTER GUNUNG) ---
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mountain_id = searchParams.get("mountain_id");

    let query = `
      SELECT 
        t.*, 
        m.name as mountain_name,
        COALESCE((SELECT SUM(b.total_members) FROM bookings b 
          WHERE b.track_id = t.id 
          AND b.status IN ('success', 'PENDING') 
          AND WEEKDAY(b.booking_date) IN (0,1,2,3,4)), 0) as booked_weekday,
        COALESCE((SELECT SUM(b.total_members) FROM bookings b 
          WHERE b.track_id = t.id 
          AND b.status IN ('success', 'PENDING') 
          AND WEEKDAY(b.booking_date) IN (5,6)), 0) as booked_weekend
      FROM tracks t
      JOIN mountains m ON t.mountain_id = m.id
    `;

    const queryParams = [];
    
    // Logic: Jika admin gunung panggil, maka filter per gunung. 
    // Jika admin sistem panggil tanpa parameter, tampilkan semua.
    if (mountain_id && mountain_id !== "null" && mountain_id !== "undefined") {
      query += ` WHERE t.mountain_id = ?`;
      queryParams.push(mountain_id);
    }

    query += ` ORDER BY t.id DESC`;

    const [rows] = await db.query(query, queryParams);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET Tracks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- TAMBAH JALUR BARU ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { mountain_id, track_name, price_weekday, price_weekend, quota_weekday, quota_weekend } = body;

    const query = `
      INSERT INTO tracks (mountain_id, track_name, price_weekday, price_weekend, quota_weekday, quota_weekend) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [mountain_id, track_name, price_weekday, price_weekend, quota_weekday, quota_weekend]);
    
    return NextResponse.json({ success: true, message: "Jalur berhasil ditambah!" });
  } catch (error) {
    console.error("POST Tracks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- UPDATE DATA JALUR ---
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, track_name, price_weekday, price_weekend, quota_weekday, quota_weekend } = body;
    
    const query = `
      UPDATE tracks 
      SET track_name = ?, price_weekday = ?, price_weekend = ?, quota_weekday = ?, quota_weekend = ? 
      WHERE id = ?
    `;
    
    await db.query(query, [track_name, price_weekday, price_weekend, quota_weekday, quota_weekend, id]);
    return NextResponse.json({ message: "Jalur berhasil diperbarui" });
  } catch (error) {
    console.error("PUT Tracks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- HAPUS JALUR ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
        return NextResponse.json({ error: "ID Jalur diperlukan" }, { status: 400 });
    }

    await db.query("DELETE FROM tracks WHERE id = ?", [id]);
    return NextResponse.json({ message: "Jalur berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Tracks Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}