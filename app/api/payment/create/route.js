import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { bookingCode, totalHarga, namaUser, emailUser } = await req.json();

    let snap = new midtransClient.Snap({
      isProduction: false, 
      serverKey: 'Mid-server-seGqk6rPp8Y2TgHJI3r2_F5j',
      clientKey: 'Mid-client-vVrOsZSaPG7z_JNw'
    });

    // Menambahkan timestamp agar order_id unik di Midtrans
    const uniqueOrderId = `${bookingCode}-${Date.now()}`;

    let parameter = {
      transaction_details: {
        order_id: uniqueOrderId, // Pakai yang unik
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}