import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { code, action } = await req.json();

    if (!code || !action) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    // Ambil data booking
    const [rows] = await db.query(
      `SELECT b.*, p.email, p.nama_lengkap 
       FROM bookings b 
       JOIN pendaki p ON b.pendaki_id = p.id 
       WHERE b.verification_code = ?`,
      [code]
    );

    const booking = rows[0];

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const currentStatus = (booking.status || "").toLowerCase();
    
    // Logic Parsing Anggota
    let memberIds = [];
    if (booking.members) {
      try {
        memberIds = typeof booking.members === 'string' ? JSON.parse(booking.members) : booking.members;
        if (!Array.isArray(memberIds)) memberIds = [];
      } catch (e) {
        memberIds = String(booking.members).split(',').map(id => id.trim()).filter(id => id);
      }
    }

    const allParticipantIds = [booking.pendaki_id, ...memberIds]
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id !== 0);

    // --- LOGIC PEMBAYARAN ---
    if (action === "pay") {
      if (currentStatus !== "pending") {
        return NextResponse.json({ success: false, error: "Hanya booking pending yang bisa dibayar" }, { status: 400 });
      }

      // Update Database
      await db.query("UPDATE bookings SET status = 'success' WHERE verification_code = ?", [code]);

      if (allParticipantIds.length > 0) {
        await db.query("UPDATE pendaki SET status_mendaki = 'on_mountain' WHERE id IN (?)", [allParticipantIds]);
      }

      // ---------------------------------------------------------
      // 🚀 PROSES KIRIM EMAIL
      // ---------------------------------------------------------
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mountaryidn@gmail.com",
            pass: "mgyu dioc fzpq gick"
          }
        });

        // Helper untuk format tanggal yang lebih bandel
        const formatIndo = (dateVal) => {
          if (!dateVal) return null;
          const d = new Date(dateVal);
          if (isNaN(d.getTime())) return null;
          return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        // LOGIKA TEKTOK: Jika return_date kosong, samakan dengan booking_date
        const tglNaikRaw = booking.booking_date;
        const tglTurunRaw = booking.return_date || booking.booking_date;

        const tglNaik = formatIndo(tglNaikRaw) || "N/A";
        const tglTurun = formatIndo(tglTurunRaw) || tglNaik;

        await transporter.sendMail({
          from: '"Mountary 🏔️" <no-reply@mountary.com>',
          to: booking.email,
          subject: `PEMBAYARAN BERHASIL - #${code}`,
          html: `
<div style="background-color: #f1f5f9; padding: 40px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 550px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    <tr>
      <td align="center" style="padding: 40px 20px 20px 20px;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 8px 20px; border-radius: 100px; display: inline-block; font-weight: 800; font-size: 12px; letter-spacing: 2px; margin-bottom: 15px;">
          MOUNTARY INDONESIA
        </div>
        <h1 style="margin: 0; color: #1e293b; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">E-TICKET PENDAKIAN</h1>
        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Simpan tiket ini untuk verifikasi di basecamp</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 10px 40px;">
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 25px; display: inline-block;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${code}" width="160" height="160" style="display: block; border-radius: 8px;" alt="QR Code" />
          <div style="margin-top: 15px; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: 5px;">#${code}</div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 40px 10px 40px;">
        <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Destinasi Pendakian</p>
          <h2 style="margin: 5px 0 0 0; font-size: 24px; color: #0f172a; font-weight: 800;">${booking.mountain_name}</h2>
          <p style="margin: 3px 0 0 0; font-size: 16px; color: #64748b;">Jalur ${booking.track_name}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Ketua Rombongan</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #1e293b;">${booking.nama_lengkap}</p>
            </td>
            <td width="50%" style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Tipe Perjalanan</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #1e293b;">${booking.trip_type || 'Mandiri'}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Jumlah Anggota</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #1e293b;">${booking.total_members} Orang</p>
            </td>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Status Pembayaran</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 800; color: #10b981;">PAID / LUNAS</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 40px 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 16px; padding: 20px; color: #ffffff;">
          <tr>
            <td width="45%" align="center">
              <p style="margin: 0; font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Tanggal Naik</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 700;">${tglNaik}</p>
            </td>
            <td width="10%" align="center">
              <div style="width: 1px; height: 30px; background-color: #334155;"></div>
            </td>
            <td width="45%" align="center">
              <p style="margin: 0; font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Tanggal Turun</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 700;">${tglTurun}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0 40px 40px 40px;">
        <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
            <strong>Catatan Penting:</strong><br/>
            Wajib membawa Kartu Identitas asli (KTP/SIM/Paspor).<br/>
            Jaga kelestarian alam dan <strong>jangan tinggalkan sampah!</strong>
          </p>
        </div>
      </td>
    </tr>
  </table>
  <p align="center" style="color: #94a3b8; font-size: 11px; margin-top: 25px;">
    &copy; 2026 Mountary Indonesia • Pesan ini dibuat secara otomatis.
  </p>
</div>
          `
        });
        console.log("✅ EMAIL TERKIRIM");
      } catch (errorEmail) {
        console.error("❌ GAGAL EMAIL:", errorEmail);
      }

      return NextResponse.json({ success: true, message: "Pembayaran berhasil!" });
    }

    // --- LOGIC CANCEL & FINISH ---
    if (action === "cancel") {
      await db.query("UPDATE bookings SET status = 'CANCELED' WHERE verification_code = ?", [code]);
      return NextResponse.json({ success: true, message: "Booking dibatalkan!" });
    }

    if (action === "finish") {
      await db.query("UPDATE bookings SET status = 'finished' WHERE verification_code = ?", [code]);
      if (allParticipantIds.length > 0) {
        await db.query("UPDATE pendaki SET status_mendaki = 'home' WHERE id IN (?)", [allParticipantIds]);
      }
      return NextResponse.json({ success: true, message: "Check-out sukses!" });
    }

    return NextResponse.json({ success: false, error: "Action tidak dikenal" }, { status: 400 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}