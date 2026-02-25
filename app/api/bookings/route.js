import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      track_id, full_name, phone, email, booking_date, 
      return_date, trip_type, total_price, nik, address,
      mountain_name, track_name, members 
    } = body;

    // 1. Cek Status Akun
    const [userRows] = await db.query(`SELECT status FROM pendaki WHERE id = ?`, [user_id]);
    if (userRows.length > 0 && userRows[0].status === 'suspended') {
      return NextResponse.json({ success: false, error: "AKUN DITANGGUHKAN!" }, { status: 403 });
    }

    // 2. Olah Member
    let memberIds = [];
    if (members && Array.isArray(members)) {
      for (const m of members) {
        const inputNik = m.nik || m.identity_number;
        if (inputNik) {
          const [res] = await db.query("SELECT id FROM pendaki WHERE nik_nisn = ?", [inputNik]);
          if (res.length > 0) memberIds.push(res[0].id);
        }
      }
    }
    const membersJson = JSON.stringify(memberIds);
    const total_people = 1 + (members ? members.length : 0);

    // 3. Cek Kuota (Limit 50)
    const [quotaRows] = await db.query(
      `SELECT SUM(total_members) as total_filled FROM bookings WHERE track_id = ? AND booking_date = ? AND status NOT IN ('CANCELED', 'EXPIRED')`,
      [track_id, booking_date]
    );
    if ((quotaRows[0].total_filled || 0) + total_people > 50) {
      return NextResponse.json({ success: false, error: "KUOTA PENUH!" }, { status: 400 });
    }

    // 4. Generate Kode
    const verification_code = "MNT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 5. Simpan Booking
    const queryBooking = `
      INSERT INTO bookings (
        pendaki_id, track_id, user_name, phone_number, email, 
        booking_date, return_date, trip_type, 
        total_members, total_price, verification_code,
        nik, address, mountain_name, track_name,
        members, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())
    `;
    
    const [result] = await db.query(queryBooking, [
      user_id, track_id, full_name, phone, email, booking_date, 
      return_date || null, trip_type, total_people, 
      total_price, verification_code, nik, address,
      mountain_name, track_name, membersJson
    ]);
    
    // 6. Simpan Detail Anggota
    const booking_id = result.insertId;
    if (members && members.length > 0) {
      const queryMember = `INSERT INTO booking_members (booking_id, member_name, identity_number) VALUES (?, ?, ?)`;
      await Promise.all(
        members.map(m => (m.full_name || m.nama) ? db.query(queryMember, [booking_id, m.full_name || m.nama, m.nik]) : Promise.resolve())
      );
    }

    return NextResponse.json({ success: true, code: verification_code, booking_id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mountain_id = searchParams.get("mountain_id");

    // Join ke tracks dan mountains supaya Admin Sistem bisa liat nama gunungnya juga
    let query = `
      SELECT b.*, t.track_name, m.name as mountain_name
      FROM bookings b
      JOIN tracks t ON b.track_id = t.id
      JOIN mountains m ON t.mountain_id = m.id
    `;
    
    const params = [];

    // LOGIKA SAKTI: 
    // Jika mountain_id ada (dikirim dari dashboard admin gunung), filter datanya.
    // Jika TIDAK ADA (admin sistem), skip WHERE ini biar muncul SEMUA.
    if (mountain_id && mountain_id !== "undefined" && mountain_id !== "") {
      query += " WHERE t.mountain_id = ?";
      params.push(mountain_id);
    }

    query += " ORDER BY b.created_at DESC";

    const [rows] = await db.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("ERROR_BOOKINGS_API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await db.query("DELETE FROM booking_members WHERE booking_id = ?", [id]);
    await db.query("DELETE FROM bookings WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}