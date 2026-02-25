"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyBooking() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleVerify = async () => {
    const res = await fetch("/api/bookings/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8">
      <h1 className="text-3xl font-black text-slate-900 mb-6">Verifikasi QR Code / Kode Booking</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-2">Input Kode Booking</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-3 border-2 border-slate-200 rounded-lg text-black outline-none focus:border-emerald-500 uppercase"
            placeholder="MNT-123456-XXX"
            onChange={(e) => setCode(e.target.value)}
          />
          <button 
            onClick={handleVerify}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold"
          >
            Cek Kode
          </button>
        </div>

        {result && (
          <div className={`mt-8 p-6 rounded-xl border-2 ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="font-bold text-lg mb-2">{result.message}</h3>
            {result.success && (
              <div className="text-slate-700 space-y-1">
                <p>Nama: <span className="font-bold">{result.data.user_name}</span></p>
                <p>Jumlah: <span className="font-bold">{result.data.total_members} Orang</span></p>
                <p>Tanggal: <span className="font-bold">{result.data.booking_date}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={() => router.push('/admin')}
        className="mt-6 text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800"
      >
        ← Kembali ke Dashboard
      </button>
    </div>
  );
}