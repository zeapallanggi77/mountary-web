import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 1. Ambil Data (GET)
export async function GET(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const [rows] = await db.query("SELECT * FROM mountains WHERE id = ?", [id]);
      return NextResponse.json(rows[0]);
    }
    const [rows] = await db.query("SELECT * FROM mountains");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Tambah Data (POST)
// ... (GET tetap sama)

// 2. Tambah Data (POST)
export async function POST(request) {
  try {
    const body = await request.json();
    // Samakan nama variabel dengan yang dikirim frontend (image_url)
    const { name, location, description, image_url } = body;

    if (!name || !image_url) {
      return NextResponse.json({ error: "Data belum lengkap bwang!" }, { status: 400 });
    }

    const query = "INSERT INTO mountains (name, location, description, image_url) VALUES (?, ?, ?, ?)";
    await db.query(query, [name, location, description, image_url]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ... (PUT & DELETE tetap sama)

// 3. Update Data (PUT)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, location, description, image_url } = body;

    const query = `
      UPDATE mountains 
      SET name = ?, location = ?, description = ?, image_url = ? 
      WHERE id = ?
    `;

    await db.query(query, [name, location, description, image_url, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. Hapus Data (DELETE)
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    await db.query("DELETE FROM mountains WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}