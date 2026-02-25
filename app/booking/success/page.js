"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const code = searchParams.get("code");
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      // Mengambil data lengkap (JOIN tabel bookings, tracks, mountains)
      fetch(`/api/bookings/detail?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setBookingData(data);
          }
        })
        .catch(err => console.error("Gagal ambil data:", err));
    }
  }, [id]);

  if (!bookingData) return <div className="p-20 text-center font-black animate-pulse">MENYIAPKAN TIKET...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 flex items-center justify-center font-sans">
      <div className="max-w-3xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER TIKET */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">E-Ticket Mountary</h1>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Status: TERVERIFIKASI ✅</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Kode Booking</p>
            <p className="text-2xl font-black text-white">{bookingData.verification_code || code}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* 1. INFORMASI GUNUNG (DESTINASI) */}
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Gunung Tujuan</p>
                <p className="font-black text-xl text-slate-800 uppercase">{bookingData.mountain_name || "Gunung -"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Jalur Pendakian</p>
                <p className="font-bold text-slate-700 uppercase italic"> {bookingData.track_name || "-"}</p>
              </div>
            </div>
          </div>

          {/* 2. DATA DIRI PENDAKI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-dashed">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
              <p className="font-bold text-slate-800 uppercase text-lg">{bookingData.user_name || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIK / Identitas</p>
              <p className="font-bold text-slate-800 font-mono italic">{bookingData.nik || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp / No. HP</p>
              <p className="font-bold text-slate-800">{bookingData.phone_number || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Domisili</p>
              <p className="font-medium text-slate-600 text-sm leading-tight">{bookingData.address || "Alamat tidak diisi"}</p>
            </div>
          </div>

          {/* 3. JADWAL & BIAYA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[2rem]">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tanggal Naik</p>
              <p className="font-bold text-sm text-slate-800">
                {bookingData.booking_date ? new Date(bookingData.booking_date).toLocaleDateString('id-ID') : "-"}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tanggal Turun</p>
              <p className="font-bold text-sm text-slate-800">
                {bookingData.return_date ? new Date(bookingData.return_date).toLocaleDateString('id-ID') : "-"}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Trip</p>
              <p className="font-black text-sm text-blue-600 uppercase">{bookingData.trip_type || "-"}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Bayar</p>
              <p className="font-black text-sm text-emerald-600">
                Rp {Number(bookingData.total_price || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* 4. QR CODE SECTION */}
          <div className="flex flex-col items-center border-t border-slate-100 pt-8 print:hidden">
            <div className="bg-white p-3 border-4 border-slate-900 rounded-3xl mb-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingData.verification_code}`} 
                alt="QR Code" 
                className="w-28 h-28"
              />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Scan QR di Pos Perizinan</p>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-8 bg-slate-900 flex gap-4 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-tighter">Cetak Tiket</button>
          <Link href="/" className="flex-1 bg-slate-800 text-white text-center py-4 rounded-2xl font-black hover:bg-slate-700 transition-all uppercase tracking-tighter">Selesai</Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black animate-pulse">MEMUAT TIKET...</div>}>
      <SuccessContent />
    </Suspense>
  );
}