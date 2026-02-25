"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const JAM_BUKA = 6; 
  const JAM_TUTUP = 17;
  const [mountain, setMountain] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [user, setUser] = useState(null);
  const [totalRombongan, setTotalRombongan] = useState(3);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getMinBookingDate = () => {
    const sekarang = new Date();
    const jamSekarang = sekarang.getHours();
    
    if (jamSekarang < JAM_BUKA || jamSekarang >= JAM_TUTUP) {
      sekarang.setDate(sekarang.getDate() + 1);
    }
    return sekarang.toLocaleDateString('en-CA');
  };

  const minDate = getMinBookingDate();
  const [quotaInfo, setQuotaInfo] = useState({ sisa: null, max: null });
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  const [formData, setFormData] = useState({
    booking_date: "", 
    return_date: "",
    trip_type: "camp", 
    track_id: ""
  });

  const getIdLabel = () => "NIK/NIS";

  useEffect(() => {
    const savedUser = localStorage.getItem("pendakiUser");
    if (!savedUser) { router.push("/login"); return; }
    
    const userData = JSON.parse(savedUser);
    fetch(`/api/user/profile?email=${userData.email}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.user) setUser(resData.user);
        else setUser(userData);
      });

    fetch("/api/mountains").then(res => res.json()).then(data => {
      setMountain(data.find(m => m.id == params.id));
    });
    fetch("/api/tracks").then(res => res.json()).then(data => {
      setTracks(data.filter(t => t.mountain_id == params.id));
    });
  }, [params.id]);

  useEffect(() => {
    const fetchQuota = async () => {
      if (formData.track_id && formData.booking_date) {
        setIsCheckingQuota(true);
        try {
          const res = await fetch(`/api/quota/check?track_id=${formData.track_id}&date=${formData.booking_date}`);
          const data = await res.json();
          setQuotaInfo({ sisa: data.sisa_kuota, max: data.kuota_max });
        } catch (err) {
          console.error("Gagal cek kuota");
          setQuotaInfo({ sisa: null, max: null });
        } finally {
          setIsCheckingQuota(false);
        }
      }
    };
    fetchQuota();
  }, [formData.track_id, formData.booking_date]);

  useEffect(() => {
    const neededMembers = totalRombongan - 1;
    let currentMembers = [...members];
    if (currentMembers.length < neededMembers) {
      for (let i = currentMembers.length; i < neededMembers; i++) {
        currentMembers.push({ 
          kode: "", full_name: "", nik: "", gender: "", weight: "", height: "", isVerified: false 
        });
      }
    } else {
      currentMembers = currentMembers.slice(0, neededMembers);
    }
    setMembers(currentMembers);
  }, [totalRombongan]);

  const handleCheckMember = async (kode, index) => {
    if (!kode) return;
    const upperKode = kode.toUpperCase();
    if (upperKode === user.kode_pendaki) {
      alert("Waduh bwang, kode ini kan punya KETUA. Masa ketua jadi anggota juga? 😂");
      return;
    }
    const isDuplicate = members.some((m, i) => i !== index && m.kode.toUpperCase() === upperKode);
    if (isDuplicate) {
      alert("Pendaki ini sudah dimasukkan ke daftar anggota, jangan diduplikat bwang!");
      return;
    }
    try {
      const res = await fetch(`/api/pendaki/check?kode=${upperKode}`);
      const data = await res.json();
      if (data.success) {
        if (data.user.status === 'suspended') {
          alert(`❌ Pendaki ${data.user.nama_lengkap} tidak bisa diajak bwang, akunnya lagi di-suspend admin!`);
          return;
        }

        const newMembers = [...members];
        newMembers[index] = { 
          ...newMembers[index], 
          full_name: data.user.nama_lengkap, 
          nik: data.user.nik_nisn,
          gender: data.user.jenis_kelamin,
          weight: data.user.berat_badan,
          height: data.user.tinggi_badan,
          isVerified: true 
        };
        setMembers(newMembers);
      } else { alert("Kode '" + upperKode + "' tidak terdaftar bwang!"); }
    } catch (err) { alert("Error cek kode."); }
  };

  const calculateTotal = () => {
    if (!selectedTrack || !formData.booking_date) return 0;
    const isWeekend = new Date(formData.booking_date).getDay() % 6 === 0;
    const price = isWeekend ? selectedTrack.price_weekend : selectedTrack.price_weekday;
    return price * totalRombongan;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.status === 'suspended') {
      alert("❌ AKUN SUSPENDED: Abang dilarang booking oleh admin!");
      return;
    }

    const sekarang = new Date();
    const jamSekarang = sekarang.getHours();
    const inputDate = new Date(formData.booking_date);
    const dateToday = new Date();
    dateToday.setHours(0,0,0,0);

    if (inputDate.getTime() === dateToday.getTime()) {
      if (jamSekarang < JAM_BUKA || jamSekarang >= JAM_TUTUP) {
        alert(`❌ Maaf bwang, booking hari ini hanya tersedia pukul ${JAM_BUKA}:00 - ${JAM_TUTUP}:00 WIB!`);
        return;
      }
    }

    if (quotaInfo.sisa !== null && totalRombongan > quotaInfo.sisa) {
      alert(`❌ Kuota tidak cukup bwang! Sisa slot: ${quotaInfo.sisa}, rombonganmu: ${totalRombongan}.`);
      return;
    }

    const allVerified = members.every(m => m.isVerified);
    if (!allVerified) { alert("Cek dulu semua kode pendaki anggota bwang!"); return; }
    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        user_id: user.id, 
        full_name: user.nama_lengkap, 
        nik: user.nik_nisn, 
        email: user.email, 
        phone: user.no_telp, 
        address: user.alamat, 
        total_price: calculateTotal(), 
        mountain_name: mountain.name, 
        track_name: selectedTrack.track_name, 
        members: members,
        total_members: totalRombongan 
      };

      const res = await fetch("/api/bookings", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });

      const result = await res.json();
      if (result.success) { 
        alert("Booking Berhasil! 🏔️"); 
        router.push(`/riwayat/${result.code}`); 
      } else { 
        alert("Gagal: " + result.error); 
        setIsLoading(false); 
      }
    } catch (err) { 
      alert("Kesalahan koneksi."); 
      setIsLoading(false); 
    }
  };
  
  if (!mountain || !user) return <div className="p-20 text-center font-black animate-pulse text-slate-400">MENYIAPKAN FORM... 🏔️</div>;

  if (user.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#fefce8] p-6 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-red-100 text-center">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200">
            <span className="text-5xl text-white">🚫</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4">Akses Dibatalkan!</h1>
          <p className="text-slate-500 font-bold italic text-sm leading-relaxed mb-8">
            Waduh bwang, akun abang <span className="text-red-500">@{user.username}</span> telah ditangguhkan oleh admin. Selesaikan urusan abang dulu baru kita muncak lagi!
          </p>
          <button 
            onClick={() => router.push("/profile")}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-red-600 transition-all shadow-xl"
          >
            KEMBALI KE PROFIL
          </button>
        </div>
      </div>
    );
  }

  const isQuotaFull = quotaInfo.sisa !== null && totalRombongan > quotaInfo.sisa;

  return (
    <div className="min-h-screen bg-[#fefce8] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100/50">
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 border-b border-slate-50 pb-8">
          <div>
            <div className="flex gap-6 mb-4">
              <button 
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span> Kembali ke Profile
              </button>
              <button 
                onClick={() => router.push("/explore")}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">🧭</span> Explore Gunung
              </button>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">Booking: {mountain.name} 🏔️</h1>
            <p className="text-slate-400 italic font-medium text-sm">Pendaftaran pendakian resmi via portal Mountary.</p>
          </div>
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] text-center shadow-xl w-full md:w-auto">
            <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Total Rombongan</p>
            <select value={totalRombongan} onChange={(e) => setTotalRombongan(parseInt(e.target.value))} className="bg-transparent font-black text-2xl outline-none cursor-pointer text-emerald-400">
              {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n} className="text-slate-900 font-bold">{n} Orang</option>)}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="bg-[#fefce8]/40 p-8 md:p-10 rounded-[3rem] shadow-inner space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">1. Pilih Jalur</label>
                <select required className="w-full p-5 border-none rounded-3xl outline-none focus:ring-4 ring-emerald-500/10 font-bold bg-white shadow-sm" onChange={(e) => {
                  const tId = e.target.value;
                  setFormData({...formData, track_id: tId});
                  setSelectedTrack(tracks.find(t => t.id == tId));
                }}>
                  <option value="">-- Pilih Jalur --</option>
                  {tracks.map(t => <option key={t.id} value={t.id}>{t.track_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">2. Tipe Perjalanan</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, trip_type: "tektok", return_date: formData.booking_date})} className={`flex-1 p-5 rounded-2xl font-black text-xs uppercase transition-all ${formData.trip_type === "tektok" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-300"}`}>🏃‍♂️ TEKTOK</button>
                  <button type="button" onClick={() => setFormData({...formData, trip_type: "camp"})} className={`flex-1 p-5 rounded-2xl font-black text-xs uppercase transition-all ${formData.trip_type === "camp" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-300"}`}>⛺ CAMPING</button>
                </div>
              </div>
            </div>

            <div className={`grid gap-6 ${formData.trip_type === "camp" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">3. Tanggal Naik</label>
                <input 
                  type="date" 
                  required 
                  min={minDate} 
                  value={formData.booking_date || ""}
                  onKeyDown={(e) => e.preventDefault()} 
                  className="w-full p-5 border-none rounded-3xl font-bold bg-white shadow-sm focus:ring-4 ring-emerald-500/10 cursor-pointer text-slate-800"
                  onChange={(e) => setFormData({...formData, booking_date: e.target.value, return_date:""})} 
                />
              </div>
              {formData.trip_type === "camp" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">4. Tanggal Turun</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.return_date || ""}
                    min={formData.booking_date ? (() => {
                      const d = new Date(formData.booking_date);
                      d.setDate(d.getDate() + 1);
                      return d.toLocaleDateString('en-CA');
                    })() : minDate}
                    onKeyDown={(e) => e.preventDefault()}
                    className={`w-full p-5 border-none rounded-3xl font-bold bg-white shadow-sm focus:ring-4 ring-emerald-500/10 transition-all ${!formData.booking_date ? "pointer-events-none opacity-50" : "opacity-100"}`}
                    onChange={(e) => setFormData({...formData, return_date: e.target.value})} 
                  />
                </div>
              )}
            </div>

            {formData.track_id && formData.booking_date && (
              <div className={`p-6 rounded-[2.5rem] border-2 border-dashed flex items-center gap-6 transition-all ${
                quotaInfo.sisa < totalRombongan ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/50'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg ${
                  quotaInfo.sisa < totalRombongan ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
                }`}>
                  {isCheckingQuota ? "..." : (quotaInfo.sisa ?? "?")}
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-tighter ${quotaInfo.sisa < totalRombongan ? 'text-red-600' : 'text-emerald-700'}`}>
                    {isCheckingQuota ? "Syncing..." : quotaInfo.sisa < totalRombongan ? "Kuota Tidak Cukup" : "Kuota Tersedia"}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 italic">
                    {isCheckingQuota ? "Sedang mengecek database..." : `Tersisa ${quotaInfo.sisa} dari ${quotaInfo.max} slot.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 ml-4">👑 Ketua Rombongan</h2>
            <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl group-hover:scale-110 transition-transform">🏔️</div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1">
                  <p className="text-emerald-400 font-black text-3xl uppercase italic tracking-tighter">{user.nama_lengkap}</p>
                  <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">{user.kode_pendaki}</p>
                </div>
                <div className="flex flex-wrap gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10">
                  <DataInfo label={getIdLabel()} value={user.nik_nisn} />
                  <DataInfo label="JK" value={user.jenis_kelamin} />
                  <DataInfo label="BB" value={user.berat_badan ? `${user.berat_badan}kg` : "-"} />
                  <DataInfo label="TB" value={user.tinggi_badan ? `${user.tinggi_badan}cm` : "-"} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 ml-4">👥 Daftar Anggota</h2>
            <div className="grid grid-cols-1 gap-6">
              {members.map((m, index) => (
                <div key={index} className={`p-6 rounded-[2.5rem] border-2 transition-all ${m.isVerified ? "border-emerald-200 bg-white" : "border-slate-100 bg-white/50"}`}>
                  <div className="flex flex-col gap-6">
                    <div className="flex gap-4 items-center">
                      <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-400 italic">#{index + 2}</div>
                      <input type="text" placeholder="MASUKKAN KODE ANGGOTA" disabled={m.isVerified} className="flex-1 p-4 border-none rounded-2xl font-mono uppercase text-xs bg-slate-50 focus:ring-4 ring-emerald-500/10" value={m.kode} onChange={(e) => { const nm = [...members]; nm[index].kode = e.target.value; setMembers(nm); }} />
                      {!m.isVerified ? (
                        <button type="button" onClick={() => handleCheckMember(m.kode, index)} className="bg-emerald-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition shadow-lg">Check</button>
                      ) : (
                        <button type="button" onClick={() => { const nm = [...members]; nm[index] = { kode: "", full_name: "", nik: "", isVerified: false }; setMembers(nm); }} className="bg-red-50 text-red-500 px-8 rounded-2xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition">Ganti</button>
                      )}
                    </div>
                    {m.isVerified && (
                      <div className="bg-[#fefce8]/40 p-6 rounded-[2rem] flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap Anggota</p>
                          <p className="font-black text-slate-800 uppercase text-lg italic tracking-tight">{m.full_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-8">
                          <DataInfo label={getIdLabel()} value={m.nik} dark />
                          <DataInfo label="JK" value={m.gender} dark />
                          <DataInfo label="BB" value={m.weight ? `${m.weight}kg` : "-"} dark />
                          <DataInfo label="TB" value={m.height ? `${m.height}cm` : "-"} dark />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-12 bg-slate-900 text-white rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl mt-20 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="text-center md:text-left">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Total Estimasi Pembayaran</p>
              <h2 className="text-5xl font-black text-emerald-400 tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</h2>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || isQuotaFull} 
              className={`w-full md:w-auto px-16 py-7 rounded-[2rem] font-black text-xl transition-all shadow-xl active:scale-95 uppercase italic transform hover:-translate-y-1 ${
                isLoading || isQuotaFull 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-emerald-500 text-white hover:bg-white hover:text-slate-900"
              }`}
            >
              {isLoading ? "Processing..." : isQuotaFull ? "Kuota Habis/Penuh 🚫" : "Konfirmasi Booking 🏔️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DataInfo({ label, value, dark = false }) {
  return (
    <div className="flex flex-col">
      <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${dark ? 'text-slate-400' : 'text-white/30'}`}>{label}</span>
      <span className={`text-xs font-bold ${dark ? 'text-slate-700' : 'text-white'}`}>{value || "-"}</span>
    </div>
  );
}