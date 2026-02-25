import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  try {
    const [rows] = await db.query("SELECT status FROM admin WHERE email = ?", [email]);
    if (rows.length === 0) return NextResponse.json({ status: 'notfound' });
    
    return NextResponse.json({ status: rows[0].status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}