"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/detail?code=${params.code}`)
      .then(res => res.json())
      .then(data => setBooking(data));
  }, [params.code]);

  const handleMidtransPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingCode: params.code, 
          totalHarga: booking.total_price,
          namaUser: booking.nama_lengkap,
          emailUser: booking.email 
        })
      });

      const data = await res.json();
      if (!data.token) throw new Error(data.error || "Gagal mendapatkan token");

      window.snap.pay(data.token, {
        onSuccess: function (result) {
          router.push(`/riwayat/${params.code}`);
        },
        onPending: function (result) {
          alert("Selesaikan pembayaranmu dulu bwang! 💸");
        },
        onError: function (result) {
          alert("Error pas bayar bwang");
        }
      });
    } catch (err) {
      console.error(err);
      alert("Error pas bayar bwang");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking) return (
    <div className="min-h-screen bg-[#fefce8] flex items-center justify-center">
      <div className="text-center font-black animate-pulse uppercase tracking-widest text-slate-400">
        Menyiapkan Checkout... 💰
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fefce8] flex items-center justify-center p-6 font-sans">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-md w-full bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-yellow-100/50">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Checkout 💸</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Pembayaran Aman via Midtrans</p>
        </div>

        {/* CARD TOTAL TAGIHAN - Tetap pakai gaya hitam pekat kamu */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] mb-10 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-white opacity-5 text-6xl rotate-12 group-hover:rotate-0 transition-transform duration-500">💰</div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Total Tagihan</p>
          <h2 className="text-4xl font-black text-white tracking-tighter">
            Rp {booking.total_price?.toLocaleString('id-ID')}
          </h2>
          <div className="mt-4 pt-4 border-t border-white/10">
             <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Booking Code: <span className="text-slate-300">#{params.code}</span></p>
          </div>
        </div>

        {/* TOMBOL BAYAR - Tetap pakai gaya emerald kamu */}
        <button 
          onClick={handleMidtransPayment}
          disabled={isProcessing}
          className={`w-full py-6 rounded-3xl font-black text-lg transition-all shadow-xl uppercase italic transform active:scale-95 ${
            isProcessing 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-emerald-600 text-white hover:bg-slate-900 hover:-translate-y-1"
          }`}
        >
          {isProcessing ? (
             <span className="flex items-center justify-center gap-2">
                <span className="animate-spin text-xl">⏳</span> Memproses...
             </span>
          ) : `Bayar Sekarang`}
        </button>

        {!isProcessing && (
          <button 
            onClick={() => router.push(`/riwayat/${params.code}`)}
            className="w-full mt-4 py-4 rounded-3xl font-black text-xs text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-[0.2em] italic"
          >
            ← Kembali ke Tiket
          </button>
        )}

        {isProcessing && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-center text-[9px] font-black text-emerald-700 animate-pulse uppercase tracking-widest">
              Jangan tutup halaman, sedang menghubungkan ke gateway pembayaran...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}