import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { adminId, action } = await req.json();

    if (action === 'rejected') {
      // Jika ditolak, kita hapus datanya dari database
      await db.query("DELETE FROM admin WHERE id = ?", [adminId]);
    } else {
      // Jika active atau banned, kita update statusnya
      await db.query("UPDATE admin SET status = ? WHERE id = ?", [action, adminId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}