// app/api/payment/create/route.js

import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { bookingCode, totalHarga, namaUser, emailUser } = await req.json();

    let snap = new midtransClient.Snap({
      // Jika key kamu TIDAK pakai "SB-", isProduction HARUS true
      isProduction: false, 
      serverKey: 'Mid-server-seGqk6rPp8Y2TgHJI3r2_F5j', // Masukkan langsung disini
      clientKey: 'Mid-client-vVrOsZSaPG7z_JNw'   // Masukkan langsung disini
    });

    let parameter = {
      transaction_details: {
        order_id: bookingCode,
        gross_amount: totalHarga,
      },
      customer_details: {
        first_name: namaUser,
        email: emailUser,
      },
    };

    const token = await snap.createTransactionToken(parameter);
    return NextResponse.json({ token });

  } catch (error) {
    console.error("Midtrans Error:", error);
    // Ini supaya kita bisa liat error aslinya di inspect element frontend
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}