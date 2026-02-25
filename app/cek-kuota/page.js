"use client";
import React, { useEffect, useState } from "react";

export default function CekKuotaPage() {
  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/tracks");
      const data = await res.json();
      if (Array.isArray(data)) setTracks(data);
    } catch (error) {
      console.error("Gagal ambil kuota:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = tracks.filter((t) =>
    (t.mountain_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.track_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-slate-900">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black uppercase text-slate-800 tracking-tighter">
          📊 Monitoring Kuota Real-Time
        </h1>
        <p className="text-slate-500 font-medium mt-2 italic">
          Kuota berkurang otomatis berdasarkan jumlah booking yang masuk.
        </p>
        
        <div className="mt-8 max-w-md mx-auto relative">
          <input 
            type="text" 
            placeholder="Cari Gunung atau Jalur..."
            className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-200 shadow-lg outline-none focus:ring-4 ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase">Menghitung Sisa Kuota...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{filteredTracks.map((t) => {
  // LOGIKA PENGURANGAN KUOTA BERDASARKAN TOTAL MEMBERS
  const totalMax = t.quota_weekday || 0; 
  const terisi = t.current_booked || 0; // Menggunakan SUM(total_members) dari API
  const sisa = totalMax - terisi;
  
  // Hitung persentase untuk progress bar (biar nggak error kalau totalMax 0)
  const persentaseSisa = totalMax > 0 ? (sisa / totalMax) * 100 : 0;

  return (
    <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group transition-all hover:shadow-2xl">
      
      {/* Badge Status - Otomatis Merah kalau Full */}
      <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest ${sisa > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
        {sisa > 0 ? 'Tersedia' : 'Penuh'}
      </div>

      <div className="mb-6">
        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase mb-2 inline-block">
          {t.mountain_name}
        </span>
        <h3 className="text-2xl font-black text-slate-800 uppercase leading-none tracking-tight">
          {t.track_name}
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-bold text-slate-400 italic">Sisa Kuota</p>
            <p className={`text-3xl font-black tracking-tighter ${sisa < 10 ? 'text-red-600' : 'text-slate-800'}`}>
              {sisa} <span className="text-sm text-slate-300 font-medium">/ {totalMax}</span>
            </p>
          </div>
          
          {/* Progress Bar Dinamis - Warna berubah pas mau habis */}
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${persentaseSisa < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
              style={{ width: `${Math.max(0, persentaseSisa)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Terisi</p>
            <p className="font-black text-orange-500 text-sm">{terisi} Orang</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Harga</p>
            <p className="font-black text-slate-800 text-right text-sm">
              Rp {Number(t.price_weekday || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Info Tambahan buat Admin/User */}
      {sisa <= 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100 text-center">
          <p className="text-[10px] font-bold text-red-600 uppercase">⚠️ Kuota sudah penuh untuk jalur ini</p>
        </div>
      )}
    </div>
  );
})}
        </div>
      )}
    </div>
  );
}