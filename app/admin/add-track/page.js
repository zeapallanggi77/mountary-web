"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTrack() {
  const [mountains, setMountains] = useState([]);
  const [formData, setFormData] = useState({
    mountain_id: "",
    track_name: "",
    price_weekday: "",
    price_weekend: "",
    quota_weekday: "",
    quota_weekend: ""
  });
  const router = useRouter();

  // --- HELPER FORMAT RIBUAN ---
  const formatRibuan = (value) => {
    if (!value) return "";
    const numberString = value.toString().replace(/[^0-9]/g, "");
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const cleanNumber = (value) => {
    return value.replace(/\./g, "");
  };

  useEffect(() => {
    fetch("/api/mountains")
      .then(res => res.json())
      .then(data => setMountains(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!formData.mountain_id || !formData.quota_weekday || !formData.quota_weekend) {
      alert("Isi semua data dulu bwang!");
      return;
    }

    const res = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("✅ Jalur & Kuota Berhasil Ditambahkan!");
      router.push("/admin");
    } else {
      alert("❌ Gagal menyimpan data ke database.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fefce8] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 shadow-2xl rounded-[3.5rem] border border-yellow-100/50">
        <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter">New Basecamp 🚩</h2>
        <p className="text-slate-400 font-bold text-[10px] mb-10 uppercase tracking-[0.2em] italic">Setting tarif dan kuota pendakian harian.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pilih Gunung */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Destinasi Gunung</label>
            <select 
              required 
              className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/10 transition font-bold shadow-inner appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, mountain_id: e.target.value})}
            >
              <option value="">-- Pilih Gunung --</option>
              {mountains.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>

          {/* Nama Jalur */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Jalur Pendakian</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: Via Ajibarang"
              className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/10 transition font-bold shadow-inner"
              onChange={(e) => setFormData({...formData, track_name: e.target.value})} 
            />
          </div>

          {/* Grid Harga (DENGAN FORMAT TITIK) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Harga Weekday (Rp)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required 
                value={formatRibuan(formData.price_weekday)}
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/10 transition font-bold shadow-inner"
                onChange={(e) => setFormData({...formData, price_weekday: cleanNumber(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Harga Weekend (Rp)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required 
                value={formatRibuan(formData.price_weekend)}
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/10 transition font-bold shadow-inner"
                onChange={(e) => setFormData({...formData, price_weekend: cleanNumber(e.target.value)})} 
              />
            </div>
          </div>

          {/* Grid Kuota (MURNI ANGKA TANPA TITIK) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 shadow-inner">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2">Kuota WD (Orang)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required 
                value={formData.quota_weekday}
                className="w-full p-5 bg-white border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/20 transition font-black shadow-sm"
                onChange={(e) => setFormData({...formData, quota_weekday: e.target.value.replace(/[^0-9]/g, "")})} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2">Kuota WE (Orang)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required 
                value={formData.quota_weekend}
                className="w-full p-5 bg-white border-none rounded-2xl text-slate-900 outline-none focus:ring-4 ring-emerald-500/20 transition font-black shadow-sm"
                onChange={(e) => setFormData({...formData, quota_weekend: e.target.value.replace(/[^0-9]/g, "")})} 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button type="submit" className="flex-[2] bg-slate-900 text-white font-black uppercase text-[11px] py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl tracking-[0.2em] active:scale-95 transform hover:-translate-y-1">
              Simpan Jalur Baru
            </button>
            <button type="button" onClick={() => router.back()} className="flex-1 bg-white border-2 border-slate-100 text-slate-400 font-black uppercase text-[11px] py-5 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all tracking-[0.2em]">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}