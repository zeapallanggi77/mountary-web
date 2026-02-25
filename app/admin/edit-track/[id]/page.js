"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditTrack() {
  const [formData, setFormData] = useState({
    track_name: "", price_weekday: "", price_weekend: "", quota_weekday: "", quota_weekend: ""
  });
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetch("/api/tracks")
      .then(res => res.json())
      .then(data => {
        const track = data.find(item => item.id == params.id);
        if (track) setFormData(track);
      });
  }, [params.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/tracks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: params.id, ...formData }),
    });
    if (res.ok) {
      alert("Jalur diperbarui!");
      router.push("/admin");
    }
  };

  return (
    /* PEMBUNGKUS LUAR: bg-[#fefce8] agar match navbar */
    <div className="min-h-screen bg-[#fefce8] p-6 md:p-12 text-slate-900 font-sans">
      
      <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 shadow-2xl rounded-[3.5rem] border border-yellow-100/50">
        <h2 className="text-4xl font-black mb-2 text-slate-800 uppercase tracking-tighter">Update Track 🚩</h2>
        <p className="text-slate-400 font-bold text-[10px] mb-10 uppercase tracking-[0.2em] italic">Modifikasi detail operasional jalur pendakian.</p>
        
        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* NAMA JALUR */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Jalur Pendakian</label>
            <input 
              type="text" 
              value={formData.track_name} 
              className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold shadow-inner"
              onChange={(e) => setFormData({...formData, track_name: e.target.value})} 
              placeholder="Contoh: Via Bambangan" 
            />
          </div>

          {/* HARGA - GRID 2 KOLOM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Harga WD (Rp)</label>
              <input 
                type="number" 
                value={formData.price_weekday} 
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold shadow-inner"
                onChange={(e) => setFormData({...formData, price_weekday: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Harga WE (Rp)</label>
              <input 
                type="number" 
                value={formData.price_weekend} 
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl outline-none focus:ring-4 ring-blue-500/10 font-bold shadow-inner"
                onChange={(e) => setFormData({...formData, price_weekend: e.target.value})} 
              />
            </div>
          </div>

          {/* KUOTA - GRID 2 KOLOM DENGAN AKSEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 shadow-inner">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Kuota WD</label>
              <input 
                type="number" 
                value={formData.quota_weekday} 
                className="w-full p-5 bg-white border-none rounded-2xl outline-none focus:ring-4 ring-blue-500/20 transition font-black shadow-sm"
                onChange={(e) => setFormData({...formData, quota_weekday: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Kuota WE</label>
              <input 
                type="number" 
                value={formData.quota_weekend} 
                className="w-full p-5 bg-white border-none rounded-2xl outline-none focus:ring-4 ring-blue-500/20 transition font-black shadow-sm"
                onChange={(e) => setFormData({...formData, quota_weekend: e.target.value})} 
              />
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 transform hover:-translate-y-1">
              Simpan Perubahan
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 bg-white border-2 border-slate-100 text-slate-400 font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}