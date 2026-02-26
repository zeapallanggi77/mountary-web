"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetailPendaki() {
  const { id } = useParams();
  const router = useRouter();
  const [pendaki, setPendaki] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // LOGIKA HYBRID: Tetap dipakai supaya foto muncul di Local & Vercel
  const getImagePath = (source) => {
    if (!source) return null;
    if (source.startsWith('http') || source.startsWith('data:')) {
      return source;
    }
    return `/uploads/${source}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/pendaki?id=${id}`);
        const data = await res.json();
        setPendaki(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Gagal ambil data bwang:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleToggleStatus = async () => {
    const isSuspended = pendaki.status === 'suspended';
    const actionText = isSuspended ? "MENGAKTIFKAN" : "SUSPEND";
    const newStatus = isSuspended ? 'active' : 'suspended';

    const confirmAction = confirm(`Apakah abang yakin mau ${actionText} akun ${pendaki.nama_lengkap}?`);
    
    if (confirmAction) {
      try {
        const res = await fetch(`/api/pendaki/${id}`, {
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }) 
        });

        if (res.ok) {
          alert(`Akun berhasil di-${newStatus === 'active' ? 'aktifkan' : 'suspend'}!`);
          setPendaki({ ...pendaki, status: newStatus });
          router.refresh(); 
        }
      } catch (error) {
        alert("Waduh, koneksinya bermasalah bwang!");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F6F0D7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3D4F3E]"></div>
        <p className="font-black text-[#3D4F3E] text-[10px] tracking-[0.3em] uppercase">Memuat Data...</p>
      </div>
    </div>
  );

  if (!pendaki) return (
    <div className="min-h-screen bg-[#F6F0D7] flex flex-col items-center justify-center font-black">
      <h1 className="text-2xl text-[#3D4F3E]">DATA TIDAK DITEMUKAN!</h1>
      <button onClick={() => router.back()} className="mt-4 bg-[#3D4F3E] text-white px-6 py-2 rounded-xl text-xs uppercase">KEMBALI</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F0D7] font-sans text-slate-900">
      <div className="w-full h-[1px] bg-[#E5DEC1] shadow-sm"></div>

      <div className="max-w-6xl mx-auto p-4 md:p-12 mt-4 md:mt-8">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => router.back()} className="bg-[#FCF9F0] border-2 border-[#E5DEC1] px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3D4F3E] hover:text-white transition shadow-sm flex items-center gap-2">
            <span className="text-lg">−</span> KEMBALI
          </button>
          <div className="text-right">
            <div className="inline-block bg-[#3D4F3E] text-[#F6F0D7] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter mb-2 shadow-sm">ADMIN PANEL</div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#3D4F3E] leading-none">PROFIL PENDAKI</h1>
            <button onClick={() => { navigator.clipboard.writeText(pendaki.kode_pendaki); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex items-center gap-2 text-[10px] text-[#A6915C] font-bold uppercase italic tracking-[0.2em] mt-2 hover:underline">
              <span>{copied ? "✔" : "📋"}</span>
              <span>{copied ? "TERSALIN" : pendaki.kode_pendaki}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-8">
            <div className="bg-[#FCF9F0] p-10 rounded-[48px] shadow-xl shadow-[#3d4f3e]/5 border border-[#E5DEC1] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#3D4F3E]"></div>
              <div className="w-40 h-40 bg-white rounded-full mx-auto mb-8 overflow-hidden border-8 border-[#F6F0D7] shadow-inner flex items-center justify-center relative">
                {/* PROFIL BUNDAR: PAKAI foto_identitas */}
                {pendaki.foto_identitas ? (
                  <img 
                    src={getImagePath(pendaki.foto_identitas)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.style.display='none'; e.target.parentElement.querySelector('.fallback-user').style.display='block'; }}
                  />
                ) : null}
                <span className={`fallback-user text-7xl ${pendaki.foto_identitas ? 'hidden' : 'block'}`}>👤</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#3D4F3E] mb-1">{pendaki.nama_lengkap}</h2>
              <p className="text-xs text-[#A6915C] font-black uppercase tracking-widest mb-6 italic">@{pendaki.username}</p>
              <div className="bg-[#F6F0D7] border border-[#E5DEC1] py-2 px-6 rounded-2xl inline-block">
                <p className="text-[10px] font-bold text-[#3D4F3E] uppercase tracking-tight">{pendaki.email}</p>
              </div>
            </div>

            {/* FISIK SECTION */}
            <div className="bg-[#BC6C25] p-8 rounded-[40px] shadow-lg shadow-[#bc6c25]/20 text-[#FEFAE0] relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-80 italic">STATISTIK FISIK</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/10 backdrop-blur-md p-5 rounded-[32px] border border-white/10">
                  <p className="text-[9px] font-black uppercase opacity-70 mb-1">BERAT</p>
                  <p className="text-2xl font-black">{pendaki.berat_badan || 0} <span className="text-xs opacity-60">KG</span></p>
                </div>
                <div className="bg-black/10 backdrop-blur-md p-5 rounded-[32px] border border-white/10">
                  <p className="text-[9px] font-black uppercase opacity-70 mb-1">TINGGI</p>
                  <p className="text-2xl font-black">{pendaki.tinggi_badan || 0} <span className="text-xs opacity-60">CM</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            {/* IDENTITAS DETAILS */}
            <div className="bg-[#FCF9F0] p-10 rounded-[48px] border border-[#E5DEC1] shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-[#3D4F3E] text-[#F6F0D7] rounded-2xl flex items-center justify-center font-black italic">ID</div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A6915C]">VALIDASI IDENTITAS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                {[
                  {label: 'NIK / NISN', val: pendaki.nik_nisn, highlight: true},
                  {label: 'Jenis Identitas', val: pendaki.jenis_identitas},
                  {label: 'Tanggal Lahir', val: pendaki.tgl_lahir ? new Date(pendaki.tgl_lahir).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"},
                  {label: 'Jenis Kelamin', val: pendaki.jenis_kelamin},
                ].map((item, i) => (
                  <div key={i} className={`pl-6 border-l-4 ${item.highlight ? 'border-[#BC6C25]' : 'border-[#E5DEC1]'}`}>
                    <p className="text-[9px] font-black text-[#A6915C] uppercase tracking-[0.2em] mb-2">{item.label}</p>
                    <p className="text-lg font-black tracking-widest text-[#3D4F3E]">{item.val || "-"}</p> 
                  </div>
                ))}
              </div>
            </div>

            {/* DOMISILI & KONTAK DARURAT (STYLING TETAP) */}
            <div className="bg-[#FCF9F0] p-10 rounded-[48px] border border-[#E5DEC1] shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A6915C] mb-10 italic">LOKASI & DOMISILI</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 {[{l:'PROVINSI', v:pendaki.provinsi}, {l:'KOTA', v:pendaki.kota}, {l:'KECAMATAN', v:pendaki.kecamatan}, {l:'KELURAHAN', v:pendaki.kelurahan}].map((it, i) => (
                   <div key={i} className="bg-[#F6F0D7] p-5 rounded-[28px] border border-[#E5DEC1]">
                     <p className="text-[8px] font-black text-[#A6915C] uppercase mb-1">{it.l}</p>
                     <p className="text-[11px] font-black uppercase text-[#3D4F3E]">{it.v || "-"}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* LAMPIRAN IDENTITAS: PAKAI foto_ktp */}
            <div className="bg-[#FCF9F0] p-10 rounded-[48px] border border-[#E5DEC1] shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#A6915C] mb-10 italic">LAMPIRAN IDENTITAS</h3>
              <div className="relative group">
                 {pendaki.foto_ktp ? (
                    <div className="overflow-hidden rounded-[40px] border-[12px] border-white shadow-2xl">
                      <img 
                        src={getImagePath(pendaki.foto_ktp)} 
                        alt="Lampiran Identitas" 
                        className="w-full h-auto"
                        onError={(e) => { e.target.parentElement.innerHTML = `<div class="p-20 text-center font-black opacity-30 uppercase italic text-[#A6915C]">File Not Found</div>`; }}
                      />
                    </div>
                 ) : (
                    <div className="h-72 bg-[#F6F0D7] rounded-[40px] border-4 border-dashed border-[#E5DEC1] flex flex-col items-center justify-center text-[#A6915C]">
                       <span className="text-6xl mb-6 opacity-20">📄</span>
                       <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 italic text-center">IDENTITAS BELUM<br/>TERUNGGAH</p>
                    </div>
                 )}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-10">
              <button onClick={handleToggleStatus} className={`w-full py-8 rounded-[32px] font-black uppercase text-xs tracking-[0.4em] transition-all duration-300 shadow-xl border-b-8 border-black/20 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-4 ${pendaki.status === 'suspended' ? "bg-[#3D4F3E] text-[#F6F0D7]" : "bg-[#7B341E] text-[#F6F0D7]"}`}>
                <span>{pendaki.status === 'suspended' ? "✅" : "⚠️"}</span> 
                {pendaki.status === 'suspended' ? "ACTIVATE ACCOUNT" : "SUSPEND ACCOUNT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}