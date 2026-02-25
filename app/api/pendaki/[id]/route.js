import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function PATCH(request, { params }) {
  try {
    // 1. Unwrap params (Next.js 15+ style)
    const resolvedParams = await params;
    const id = resolvedParams.id; 

    // 2. Ambil data dari body
    const body = await request.json();
    const status = body.status; // Ini akan berisi 'suspended' atau 'active'

    // Validasi input
    if (!id || !status) {
      return NextResponse.json({ error: "Data ID atau Status kosong bwang!" }, { status: 400 });
    }

    // 3. Query Update Status Pendaki
    const query = "UPDATE pendaki SET status = ? WHERE id = ?";
    const values = [status, id];

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Data pendaki nggak ketemu di DB bwang!" }, { status: 404 });
    }

    // --- FITUR TAMBAHAN: LOGIC SAAT SUSPENDED ---
    if (status === 'suspended') {
      // Jika di-suspend, batalkan semua booking yang masih pending
      const cancelBookingQuery = "UPDATE bookings SET status = 'CANCELED' WHERE pendaki_id = ? AND status = 'pending'";
      await db.execute(cancelBookingQuery, [id]);
    }

    // --- FITUR TAMBAHAN: LOGIC SAAT DIAKTIFKAN ---
    if (status === 'active') {
      // Jika diaktifkan kembali, pastikan status_mendaki-nya 'home' (biar bersih)
      const resetMendakiQuery = "UPDATE pendaki SET status_mendaki = 'home' WHERE id = ?";
      await db.execute(resetMendakiQuery, [id]);
    }

    return NextResponse.json({ 
      success: true,
      message: status === 'suspended' 
        ? "Akun resmi di-suspend & booking pending otomatis dibatalkan!" 
        : "Akun berhasil diaktifkan kembali bwang! Siap muncak lagi.", 
    }, { status: 200 });

  } catch (error) {
    console.error("Database error bwang:", error);
    return NextResponse.json({ error: "Gagal update database bwang: " + error.message }, { status: 500 });
  }
}