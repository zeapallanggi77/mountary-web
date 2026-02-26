"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("pendakiUser");
    if (!savedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(savedUser);
    
    setUser(userData);
    setFormData({ ...userData, new_password: "" }); // Inisialisasi field password kosong

    const getProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile?email=${userData.email}`);
        const resData = await res.json();

        if (resData.user) {
          if (resData.user.status === 'suspended') {
            alert("⚠️ AKUN DITANGGUHKAN! Sesi abang berakhir karena akun kena suspend. Silakan hubungi admin.");
            localStorage.removeItem("pendakiUser");
            router.push("/login");
            return;
          }

          const dataBaru = {
            ...userData,
            ...resData.user 
          };

          setUser(dataBaru);
          setFormData({ ...dataBaru, new_password: "" });

          if (resData.user.foto_identitas) {
            setPreviewImage(resData.user.foto_identitas);
          } else if (userData.foto_identitas) {
            setPreviewImage(userData.foto_identitas);
          }
          
          localStorage.setItem("pendakiUser", JSON.stringify(dataBaru));
        }
        
        setHistory(Array.isArray(resData.history) ? resData.history : []);
      } catch (err) {
        console.error("Gagal ambil profil:", err);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["nik_nisn", "no_telp"];

    if (numericFields.includes(name)) {
      const sanitizedValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.email) {
      alert("Error: Email tidak ditemukan bwang!");
      return;
    }

    // Validasi panjang password jika diisi
    if (formData.new_password && formData.new_password.length < 6) {
      alert("Password minimal 6 karakter bwang! 🔒");
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...formData }), 
      });
      
      if (res.ok) {
        // Jangan simpan password ke local storage demi keamanan
        const { new_password, ...dataToSave } = formData;
        const updatedData = { ...user, ...dataToSave };
        
        setUser(updatedData);
        setFormData({ ...updatedData, new_password: "" }); // Reset field password
        localStorage.setItem("pendakiUser", JSON.stringify(updatedData));
        setIsEditing(false);
        alert("Profil & Password berhasil diperbarui bwang! ✨");
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.message || "Kesalahan server"}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Terjadi kesalahan koneksi bwang.");
    }
  };

  const handleCopyKode = () => {
    if (user?.kode_pendaki) {
      navigator.clipboard.writeText(user.kode_pendaki);
      alert("Kode Pendaki berhasil di-copy bwang! 📋");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Foto kegedean bwang! Maksimal 2MB ya.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setPreviewImage(base64String);

        const res = await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: user.email, 
            foto_identitas: base64String 
          }),
        });

        if (res.ok) {
          const updatedUser = { ...user, foto_identitas: base64String };
          setUser(updatedUser);
          localStorage.setItem("pendakiUser", JSON.stringify(updatedUser));
          alert("Foto Identitas Berhasil Diupload! 📸");
        } else {
          alert("Gagal upload ke server bwang!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !user) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Menyiapkan Profil Pendaki... 🏔️</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20 text-slate-900">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white pt-12 pb-32 md:pb-40 px-6 md:px-10 shadow-lg rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] italic">Mountary Profile</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Profil Saya</h1>
          </div>

          <div className="flex flex-row gap-3 w-full md:w-auto">
             <button 
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} 
              className={`${isEditing ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'} flex-1 md:flex-none px-6 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase italic transition text-white shadow-xl active:scale-95 flex items-center justify-center gap-2`}
             >
               {isEditing ? "💾 Simpan" : "✏️ Edit Profil"}
             </button>
             <button 
              onClick={() => { localStorage.clear(); router.push("/"); }} 
              className="bg-white/10 backdrop-blur-md border border-white/20 flex-1 md:flex-none px-6 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase italic hover:bg-red-600 transition text-white shadow-lg flex items-center justify-center"
             >
               Logout
             </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-6xl mx-auto -mt-20 md:-mt-24 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR PROFIL */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden h-fit">
            <button 
              onClick={handleCopyKode}
              className="bg-emerald-100 text-emerald-700 font-black text-[10px] py-1.5 px-4 rounded-full inline-block mb-8 border border-emerald-200 uppercase tracking-widest italic hover:bg-emerald-200 transition active:scale-95"
            >
              Kode Pendaki : {user?.kode_pendaki || "------"} 📋
            </button>
            
            <div className="flex flex-col items-center">
              <div className="w-44 h-44 rounded-full overflow-hidden border-8 border-slate-50 shadow-xl mb-4 bg-slate-200 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-slate-400 font-black italic uppercase">{user?.username?.substring(0, 2) || "??"}</span>
                )}
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter italic">{user?.username || "Pendaki"}</h2>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl uppercase shadow-md active:scale-95 hover:bg-slate-800 transition tracking-widest"
              >
                Ubah Foto Identitas
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        {/* DETAIL INFO */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Alamat Email (Akun)</p>
                <p className="font-black text-emerald-600 text-lg border-b-2 border-slate-50 pb-3 tracking-tighter italic">{user?.email || "-"}</p>
              </div>

              <EditableDetailRow label="Username" name="username" value={formData.username} isEditing={isEditing} onChange={handleInputChange} />
              <EditableDetailRow label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} isEditing={isEditing} onChange={handleInputChange} />
              <EditableDetailRow label="No. Telp / WA" name="no_telp" value={formData.no_telp} isEditing={isEditing} onChange={handleInputChange} />
              <EditableDetailRow label="NIK / NISN" name="nik_nisn" value={formData.nik_nisn} isEditing={isEditing} onChange={handleInputChange} />
              
              {/* INPUT PASSWORD BARU (Hanya saat edit) */}
              {isEditing && (
                <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 border-dashed">
                  <EditableDetailRow 
  label="Ganti Password (Kosongkan jika tidak diubah)" 
  name="new_password" 
  value={formData.new_password} 
  isEditing={isEditing} 
  onChange={handleInputChange} 
  type="password" // <--- Ini pemicu munculnya ikon mata
  full 
/>
                </div>
              )}

              <EditableDetailRow label="Alamat Domisili" name="alamat" value={formData.alamat} isEditing={isEditing} onChange={handleInputChange} full />
              <EditableDetailRow label="Kota" name="kota" value={formData.kota} isEditing={isEditing} onChange={handleInputChange} />
              <EditableDetailRow label="Tinggi Badan (CM)" name="tinggi_badan" value={formData.tinggi_badan} isEditing={isEditing} onChange={handleInputChange} type="number" />
              <EditableDetailRow label="Berat Badan (KG)" name="berat_badan" value={formData.berat_badan} isEditing={isEditing} onChange={handleInputChange} type="number" />
            </div>
            {isEditing && (
              <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <p className="text-[10px] text-orange-600 font-black italic uppercase animate-pulse text-center">Sedang dalam mode edit bwang, jangan lupa klik SIMPAN di atas! ⚠️</p>
              </div>
            )}
          </div>

          {/* RIWAYAT */}
          <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 px-10 flex flex-col md:flex-row justify-between items-center border-b border-white/10 text-white gap-6">
                <div className="text-center md:text-left">
                  <h3 className="font-black uppercase italic tracking-tighter text-2xl">E-Ticket</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Riwayat Pendakian Anda</p>
                </div>
                <button onClick={() => router.push("/explore")} className="bg-emerald-500 text-white w-full md:w-auto px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-white hover:text-emerald-900 transition shadow-lg italic">Booking Sekarang</button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="py-20 text-center">
                   <span className="text-5xl block mb-4">🏔️</span>
                   <p className="text-slate-500 font-black italic uppercase tracking-widest text-xs">Belum ada riwayat pendakian bwang.</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => router.push(`/riwayat/${item.verification_code}`)}
                    className="cursor-pointer bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center hover:bg-white/10 transition group text-white border-l-4 border-l-emerald-500 gap-6"
                  >
                    <div className="flex gap-6 items-center w-full md:w-auto">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:rotate-3 transition-transform">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.verification_code}`}
                            className="w-12 h-12"
                            alt="qr"
                          />
                        </div>
                        
                        <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-black uppercase italic">Verified</span>
                           <p className="text-white font-black text-xl md:text-2xl uppercase italic tracking-tighter leading-none">{item.mountain_name}</p>
                         </div>
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                           {item.track_name} • {new Date(item.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </p>
                       </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto justify-between pt-6 md:pt-0 border-t md:border-t-0 border-white/10">
                      <p className="text-white font-mono font-black text-sm tracking-widest opacity-40">#{item.verification_code}</p>
                      <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg ${
                           item.status === 'pending' ? 'bg-amber-500 text-slate-900' : 
                           item.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                         }`}>
                          {item.status}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                           <span className="text-white text-lg">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableDetailRow({ label, name, value, isEditing, onChange, full = false, type = "text" }) {
  const [showPassword, setShowPassword] = useState(false); // State buat mata

  // Tentukan tipe input: kalau password dan mata kebuka, jadi text. Kalau gak, balik ke default.
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{label}</p>
      {isEditing ? (
        <div className="relative group">
          <input 
            type={inputType}
            name={name}
            value={value || ""}
            onChange={onChange}
            autoComplete={type === "password" ? "new-password" : "off"}
            inputMode={name === "nik_nisn" || name === "no_telp" ? "numeric" : "text"}
            className="w-full bg-slate-50 border-b-4 border-emerald-400 py-3 px-2 text-base font-black text-slate-700 outline-none focus:bg-emerald-50 transition uppercase tracking-tighter pr-10"
          />
          
          {/* TOMBOL MATA: Hanya muncul jika type-nya "password" */}
{type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors p-2"
            >
              {showPassword ? (
                // Ikon Mata Coret (Hide)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                // Ikon Mata Terbuka (Show)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          )}
        </div>
      ) : (
        <p className="font-black text-slate-700 text-lg border-b-2 border-slate-50 pb-3 uppercase tracking-tighter italic">
          {type === "password" ? "••••••••" : (value || "-")}
        </p>
      )}
    </div>
  );
}
