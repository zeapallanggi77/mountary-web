import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mountary",
});

export async function POST(request) {
  try {
    const body = await request.json();
    const verification_code = `MNT-${Math.random().toString(36).toUpperCase().substring(2, 8)}`;

    // Urutan kolom di sini harus SAMA PERSIS dengan urutan di bagian [body.xxx]
    const query = `
      INSERT INTO bookings (
        mountain_id, track_id, full_name, phone, email, 
        birth_date, gender, address, emergency_contact, 
        nik, school_name, nisn, parent_name, parent_phone, 
        booking_date, verification_code, total_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      body.mountain_id,
      body.track_id,
      body.full_name,
      body.phone,
      body.email || null,
      body.birth_date || null,
      body.gender || null,
      body.address || null,
      body.emergency_contact || null,
      body.nik || null,
      body.school_name || null,
      body.nisn || null,
      body.parent_name || null,
      body.parent_phone || null,
      body.booking_date,
      verification_code,
      body.total_price || 0,
      'Menunggu' // Status default
    ];

    // Di dalam app/api/booking/route.js (fungsi POST)
const [result] = await db.query(query, values);

return NextResponse.json({ 
  success: true, 
  code: verification_code,
  id: result.insertId // Baris ini WAJIB ada supaya halaman sukses dapet ID-nya
});

  } catch (error) {
    console.error("DETAIL ERROR DATABASE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}