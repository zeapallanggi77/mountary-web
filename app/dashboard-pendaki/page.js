"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function DashboardPendaki() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("pendakiUser");
    if (data) setUser(JSON.parse(data));
  }, []);

  if (!user) return <div className="p-20 text-center font-black">LOGIN DULU BWANG...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* POV: KARTU IDENTITAS DIGITAL */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-10 text-white shadow-2xl mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-70">Identitas Pendaki Terverifikasi</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{user.nama_lengkap}</h1>
          <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 mt-4">
            <span className="text-[10px] block font-bold opacity-70 uppercase">Kode Pendaki</span>
            <span className="text-2xl font-mono font-black tracking-widest">{user.kode_pendaki}</span>
          </div>
        </div>

        {/* POV: MENU AKSI CEPAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition">
            <h3 className="font-black text-xl mb-2 italic">Ajak Rombongan? 🏔️</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Berikan Kode Pendakimu ke ketua rombongan untuk registrasi cepat.</p>
            <button className="text-emerald-600 font-black uppercase text-xs tracking-widest border-b-2 border-emerald-600 pb-1">Salin Kode</button>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition">
            <h3 className="font-black text-xl mb-2 italic">Riwayat Naik Gunung</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Lihat daftar gunung yang sudah kamu taklukkan sebelumnya.</p>
            <button className="text-slate-400 font-black uppercase text-xs tracking-widest">Belum Ada Riwayat</button>
          </div>
        </div>
      </div>
    </div>
  );
}