import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // pakai port 465 untuk koneksi aman
  auth: {
    user: "mountaryidn@gmail.com",
    pass: "lundeyltetqbmjml", 
  },
  tls: {
    // Jangan blokir meskipun sertifikatnya self-signed (sering terjadi di localhost)
    rejectUnauthorized: false
  }
});

// ... (Bagian import & transporter tetap sama) ...

export async function POST(request) {
  try {
    const { code } = await request.json();

    // 1. Ambil data booking lengkap dulu
    const [rows] = await db.query("SELECT * FROM bookings WHERE verification_code = ?", [code]);
    if (rows.length === 0) return NextResponse.json({ error: "Kode Gak Ada!" }, { status: 404 });
    const b = rows[0];

    // 2. Update status jadi success
    await db.query("UPDATE bookings SET status = 'success' WHERE verification_code = ?", [code]);

    // 3. Siapkan E-Ticket
    const qrUrl = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${b.verification_code}`;
    const mailOptions = {
      from: '"Mountary Indonesia" <mountaryidn@gmail.com>',
      to: b.email,
      subject: `LUNAS: ${b.verification_code} - ${b.mountain_name}`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 20px;">
          <h1 style="color: #10b981;">PEMBAYARAN BERHASIL</h1>
          <p>Halo ${b.user_name}, tiket kamu sudah aktif!</p>
          <img src="${qrUrl}" alt="QR" />
          <p><b>Gunung:</b> ${b.mountain_name}</p>
          <p><b>Kode Booking:</b> ${b.verification_code}</p>
        </div>
      `,
    };

    // 4. Kirim Email (PENTING: Gunakan await)
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email terkirim ke:", b.email);
    } catch (e) {
      console.error("❌ Email Gagal:", e.message);
    }

    // 5. Respon Notifikasi ke Frontend
    return NextResponse.json({ 
      success: true, 
      message: "SELAMAT PEMBAYARAN BERHASIL, E-TICKET AKAN DIKIRIM MELALUI EMAIL" 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}