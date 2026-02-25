"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditMountain() {
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    description: "", 
    image_url: "" 
  });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const params = useParams();

  // 1. AMBIL DATA LAMA (DIPERBAIKI: image_url sekarang ikut masuk)
  useEffect(() => {
    if (!params.id) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/mountains");
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : (data.data || data.mountains || []);

        if (safeData.length > 0) {
          const mountain = safeData.find(m => String(m.id) === String(params.id));
          
          if (mountain) {
            setFormData({
              name: mountain.name || "",
              location: mountain.location || "",
              description: mountain.description || "",
              image_url: mountain.image_url || "" // <-- INI TADI KETINGGALAN BWANG
            });
          }
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };

    fetchData();
  }, [params.id]);

  // 2. PROSES UPLOAD FOTO
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.set('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, image_url: result.url }));
      }
    } catch (err) {
      alert("Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  // 3. SIMPAN PERUBAHAN (DITAMBAH VALIDASI FOTO)
  const handleUpdate = async (e) => {
    e.preventDefault();

    // --- VALIDASI WAJIB FOTO ---
    if (!formData.image_url || formData.image_url.trim() === "") {
      return alert("❌ Waduh bwang, foto gunungnya jangan dikosongin! Upload dulu ya.");
    }

    setUploading(true); // Re-use loading state for saving
    try {
      const res = await fetch("/api/mountains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, ...formData }),
      });

      if (res.ok) {
        alert("✅ Foto dan Data Berhasil Disimpan!");
        router.push("/admin");
      } else {
        alert("❌ Gagal menyimpan ke database.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefce8] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 shadow-2xl rounded-[3.5rem] border border-yellow-100/50">
        <h2 className="text-4xl font-black mb-2 text-slate-800 uppercase tracking-tighter">Edit Destination 📸</h2>
        <p className="text-slate-400 font-bold text-[10px] mb-10 uppercase tracking-[0.2em] italic">Perbarui informasi dan visual pendakian.</p>
        
        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* SECTION FOTO */}
          <div className="bg-[#fefce8]/40 p-8 rounded-[2.5rem] border-2 border-dashed border-yellow-200/50 shadow-inner">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">Update Gallery Image</label>
            
            <div className="flex flex-col items-center gap-6">
              {formData.image_url ? (
                <div className="relative w-full group">
                  <img 
                    src={formData.image_url} 
                    className="w-full h-64 object-cover rounded-[2rem] border-4 border-white shadow-xl group-hover:brightness-90 transition-all" 
                    alt="Preview" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/50 text-white text-[10px] font-black px-4 py-2 rounded-full backdrop-blur-sm">GANTI FOTO</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                  <span className="text-4xl mb-2">🖼️</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Belum ada foto</p>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="block w-full text-xs text-slate-400 file:mr-6 file:py-3 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-emerald-600 file:transition-all cursor-pointer" 
              />
              
              {uploading && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Processing...</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION DATA TEXT */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Nama Gunung</label>
              <input 
                type="text" 
                required
                value={formData.name} 
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl outline-none focus:ring-4 ring-emerald-500/10 font-bold shadow-inner" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Lokasi</label>
              <input 
                type="text" 
                required
                value={formData.location} 
                className="w-full p-5 bg-[#fefce8]/40 border-none rounded-2xl outline-none focus:ring-4 ring-emerald-500/10 font-bold shadow-inner" 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Deskripsi Lengkap</label>
              <textarea 
                required
                value={formData.description} 
                className="w-full p-6 bg-[#fefce8]/40 border-none rounded-[2rem] outline-none focus:ring-4 ring-emerald-500/10 font-medium h-40 shadow-inner leading-relaxed" 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* BUTTON ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              type="submit" 
              disabled={uploading}
              className={`flex-[2] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 transform ${uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-slate-900 hover:-translate-y-1 text-white'}`}
            >
              {uploading ? "Sabar bwang..." : "Simpan Perubahan"}
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