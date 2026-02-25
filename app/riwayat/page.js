"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RiwayatPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("pendakiUser");
    if (!savedUser) {
      router.push("/login-pendaki");
      return;
    }
    const user = JSON.parse(savedUser);

    fetch(`/api/user/history?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal load riwayat:", err);
        setLoading(false);
      });
  }, []);

  // --- FUNGSI BARU UNTUK KONFIRMASI PEMBAYARAN ---
  const handleConfirmPayment = async (code) => {
    const confirmDulu = confirm("Apakah kamu sudah melakukan pembayaran?");
    if (!confirmDulu) return;

    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      });
      
      const data = await res.json();

      if (data.success) {
        // Notifikasi sesuai permintaan kamu bwang
        alert("SELAMAT PEMBAYARAN BERHASIL, E-TICKET AKAN DIKIRIM MELALUI EMAIL");
        window.location.reload(); 
      } else {
        alert("Gagal: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      alert("Gagal menyambung ke server bwang.");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">MENCARI TIKETMU... 🎫</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 mb-2">E-Ticket Saya</h1>
        <p className="text-slate-500 mb-10 font-bold">Daftar booking aktif dan riwayat pendakianmu.</p>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center shadow-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-300 font-black text-xl italic uppercase">Belum ada tiket bwang. Ayo muncak!</p>
            <button onClick={() => router.push("/explore")} className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Cari Gunung Sekarang</button>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row">
                
                {/* BAGIAN KIRI: QR CODE */}
                <div className="bg-slate-900 p-10 flex flex-col items-center justify-center text-center md:w-1/3">
                  <div className="bg-white p-3 rounded-2xl mb-4">
                    <img 
                      src={`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${ticket.verification_code}&choe=UTF-8`} 
                      alt="QR Ticket"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-white font-mono font-black tracking-[0.3em] text-sm uppercase">{ticket.verification_code}</p>
                  <span className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase ${ticket.status === 'pending' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                    {ticket.status}
                  </span>
                </div>

                {/* BAGIAN KANAN: DETAIL */}
                <div className="p-10 flex-1 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-emerald-600 uppercase italic tracking-tighter">{ticket.mountain_name}</h2>
                      <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">Jalur {ticket.track_name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-300 uppercase">Tanggal Naik</p>
                       <p className="font-black text-slate-700">{new Date(ticket.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 border-t pt-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase">Ketua Rombongan</p>
                      <p className="font-bold text-slate-700">{ticket.user_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase">Total Personil</p>
                      <p className="font-bold text-slate-700">{ticket.total_members} Orang</p>
                    </div>
                  </div>

                  {/* MODIFIKASI TOMBOL: Jika Pending muncul Konfirmasi, Jika Success muncul Download */}
                  <div className="mt-8 flex gap-4">
                    {ticket.status === 'pending' ? (
                      <button 
                        onClick={() => handleConfirmPayment(ticket.verification_code)}
                        className="flex-1 bg-amber-500 text-white py-4 rounded-xl font-black text-xs uppercase hover:bg-amber-600 transition shadow-lg shadow-amber-200"
                      >
                        Konfirmasi Pembayaran
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition">Lihat Anggota</button>
                        <button className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-100 transition">Download PDF</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}