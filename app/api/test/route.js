import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    return NextResponse.json({ message: "Koneksi Mountary ke MySQL Berhasil!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}