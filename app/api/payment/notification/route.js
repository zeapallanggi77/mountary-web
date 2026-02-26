import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "Mid-server-seGqk6rPp8Y2TgHJI3r2_F5j";
    const payload = order_id + status_code + gross_amount + serverKey;
    const hashed = crypto.createHash("sha512").update(payload).digest("hex");

    if (hashed !== signature_key) {
      return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
    }

    if (transaction_status === "settlement" || transaction_status === "capture") {
      
      // Ambil kode asli (MNT-XXX) dengan membuang timestamp dibelakangnya
      const originalBookingCode = order_id.split("-")[0] + "-" + order_id.split("-")[1];

      const [rows] = await db.query(
        `SELECT b.*, p.email, p.nama_lengkap 
         FROM bookings b 
         JOIN pendaki p ON b.pendaki_id = p.id 
         WHERE b.verification_code = ?`, 
        [originalBookingCode] // Gunakan kode asli untuk cari di DB
      );
      const booking = rows[0];

      if (booking) {
        await db.query("UPDATE bookings SET status = 'success' WHERE verification_code = ?", [originalBookingCode]);

        let memberIds = [];
        if (booking.members) {
          try {
            memberIds = typeof booking.members === 'string' ? JSON.parse(booking.members) : booking.members;
          } catch (e) {
            memberIds = String(booking.members).split(',').map(id => id.trim()).filter(id => id);
          }
        }

        const allParticipantIds = [booking.pendaki_id, ...memberIds]
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id !== 0);

        if (allParticipantIds.length > 0) {
          await db.query("UPDATE pendaki SET status_mendaki = 'on_mountain' WHERE id IN (?)", [allParticipantIds]);
          console.log(`✅ Status rombongan #${originalBookingCode} sekarang: DI GUNUNG`);
        }

        try {
          await sendSuccessEmail(booking, originalBookingCode);
        } catch (mailError) {
          console.error("❌ Email Gagal dikirim:", mailError);
        }
      }
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("❌ Notification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendSuccessEmail(booking, code) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: "mountaryidn@gmail.com",
      pass: "mgyu dioc fzpq gick" 
},
    family: 4, // Paksa IPv4
    connectionTimeout: 60000, 
    greetingTimeout: 60000,
    tls: { rejectUnauthorized: false }
  });

  const formatIndo = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const tglNaik = formatIndo(booking.booking_date);
  const tglTurun = formatIndo(booking.return_date || booking.booking_date);

  await transporter.sendMail({
    from: '"Mountary 🏔️" <mountaryidn@gmail.com>',
    to: booking.email,
    subject: `Halo ${booking.nama_lengkap}, E-Ticket pendakianmu sudah aktif!`,
    html: `
<div style="background-color: #000000; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; text-align: center;">
  <div style="max-width: 400px; margin: 0 auto; background-color: #121212; border-radius: 30px; border: 1px solid #333; overflow: hidden; padding-bottom: 30px;">
    <div style="padding: 30px 20px 10px 20px; text-align: left;">
      <p style="font-size: 16px; margin: 0; color: #ffffff;">Halo <b>${booking.nama_lengkap}</b>, E-Ticket pendakianmu sudah aktif!</p>
    </div>
    <div style="background-color: #1e1e1e; margin: 20px; border-radius: 25px; padding: 30px; border: 1px solid #444;">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${code}&color=ffffff&bgcolor=1e1e1e" width="180" height="180" style="display: block; margin: 0 auto;" alt="QR Code" />
      <div style="margin-top: 20px; font-size: 24px; font-weight: bold; letter-spacing: 6px; color: #ffffff;">${code}</div>
    </div>
    <div style="background-color: #1e1e1e; margin: 0 20px; border-radius: 25px; padding: 25px; border: 1px solid #444; text-align: left;">
      <table width="100%" cellpadding="0" cellspacing="0" style="color: #888; font-size: 14px;">
        <tr>
          <td style="padding-bottom: 15px;">Nama Gunung</td>
          <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: bold;">${booking.mountain_name || 'n'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 15px;">Jalur Lewat</td>
          <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: bold;">${booking.track_name || 'h'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 15px;">Tipe Perjalanan</td>
          <td style="padding-bottom: 15px; text-align: right; color: #00ff88; font-weight: bold;">${booking.trip_type || 'CAMP'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 15px;">Ketua Rombongan</td>
          <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: bold;">${booking.nama_lengkap}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 15px;">Tanggal Naik</td>
          <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: bold;">${tglNaik}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 5px;">Tanggal Turun</td>
          <td style="padding-bottom: 5px; text-align: right; color: #fff; font-weight: bold;">${tglTurun}</td>
        </tr>
      </table>
    </div>
    <p style="margin-top: 30px; font-size: 13px; color: #666; padding: 0 40px;">Tunjukkan QR Code ini saat registrasi di basecamp.</p>
  </div>
  <p style="font-size: 11px; color: #444; margin-top: 20px;">&copy; 2026 Mountary Indonesia</p>
</div>
    `
  });
}