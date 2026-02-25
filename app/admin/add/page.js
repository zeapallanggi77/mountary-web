"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMountain() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

// Di dalam function AddMountain()

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Fungsi untuk kompres gambar sebelum jadi Base64
    const compressImage = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800; // Kita batasi lebar maksimal 800px
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Kita turunkan kualitasnya ke 0.7 (70%)
            const base64 = canvas.toDataURL("image/jpeg", 0.7);
            resolve(base64);
          };
        };
      });
    };

    const base64Image = image ? await compressImage(image) : "";

    const payload = {
      name,
      location,
      description,
      image_url: base64Image
    };

    const res = await fetch("/api/mountains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Gunung Berhasil Ditambahkan! 🏔️");
      router.push("/admin");
    } else {
      alert(`Gagal: ${result.error}`);
    }
  } catch (error) {
    alert("Error sistem, cek konsol!");
  } finally {
    setLoading(false);
  }
};
  return (
    /* GANTI: bg-slate-50 -> bg-[#fefce8] biar match navbar */
    <div className="min-h-screen bg-[#fefce8] p-6 md:p-12 text-slate-900 font-sans">
      
      {/* CARD FORM - Dibuat melengkung sempurna [3rem] */}
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100/50">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-slate-800">New Expedition 🏔️</h1>
        <p className="text-slate-400 mb-10 italic font-medium text-sm">Input data gunung baru ke dalam sistem portal pendaki.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Nama Gunung</label>
             <input type="text" placeholder="Contoh: Gunung Slamet" className="w-full p-5 border-none rounded-3xl outline-none focus:ring-4 ring-emerald-500/10 font-bold bg-[#fefce8]/40 shadow-inner" onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Wilayah / Lokasi</label>
             <input type="text" placeholder="Contoh: Jawa Tengah" className="w-full p-5 border-none rounded-3xl outline-none focus:ring-4 ring-emerald-500/10 font-bold bg-[#fefce8]/40 shadow-inner" onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Deskripsi</label>
             <textarea placeholder="Ceritakan keindahan gunung ini..." className="w-full p-6 border-none rounded-[2rem] outline-none focus:ring-4 ring-emerald-500/10 h-40 bg-[#fefce8]/40 shadow-inner font-medium leading-relaxed" onChange={(e) => setDescription(e.target.value)} required></textarea>
          </div>
          
          {/* SEKSI UPLOAD FOTO */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Cover Image</label>
            <div className={`p-8 border-2 border-dashed ${preview ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-[#fefce8]/20'} rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all`}>
              {preview ? (
                <div className="relative w-full">
                   <img src={preview} alt="Preview" className="w-full h-56 object-cover rounded-[2rem] shadow-xl border-4 border-white" />
                   <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg">✓</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl opacity-20">🖼️</span>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Belum ada foto dipilih</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="text-xs font-bold text-slate-400 file:mr-6 file:py-3 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-emerald-600 file:transition-all cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <button type="submit" className="flex-[2] bg-emerald-600 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95 transform hover:-translate-y-1">Simpan Data</button>
            <button type="button" onClick={() => router.back()} className="flex-1 bg-white border-2 border-slate-100 p-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}