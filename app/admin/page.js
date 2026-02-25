"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function AdminDashboard() {
  const [mountains, setMountains] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [user, setUser] = useState(null); 
  
  // --- STATE BARU UNTUK DATABASE MEMBER ---
  const [allPendaki, setAllPendaki] = useState([]); // <--- TAMBAHAN
  
  // --- STATE UNTUK NAVIGASI TAB ---
  const [activeTab, setActiveTab] = useState("mountains"); 
  
  const [searchTrack, setSearchTrack] = useState("");
  const [searchMountain, setSearchMountain] = useState("");
  const [searchBooking, setSearchBooking] = useState(""); 
  const [searchManifest, setSearchManifest] = useState(""); 
  
  const router = useRouter();

  // --- FETCH DATA FUNCTIONS ---
  
  // Fungsi Baru: Mengambil semua user yang sudah register (tanpa harus booking)
  const fetchAllPendaki = async () => {
    try {
      const res = await fetch("/api/pendaki"); // Pastikan API ini sudah dibuat
      const result = await res.json();
      setAllPendaki(Array.isArray(result) ? result : []);
    } catch (error) { console.error("Error fetching members:", error); }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const result = await res.json();
      const data = Array.isArray(result) ? result : (result.data || result.bookings || []);
      setBookings(data);
    } catch (error) { console.error("Error booking:", error); }
  };

  const fetchMountains = async () => {
    try {
      const res = await fetch("/api/mountains");
      const result = await res.json();
      const data = Array.isArray(result) ? result : (result.data || result.mountains || []);
      setMountains(data);
    } catch (error) { console.error("Error mountain:", error); }
  };

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/tracks");
      const result = await res.json();
      const data = Array.isArray(result) ? result : (result.data || result.tracks || []);
      setTracks(data);
    } catch (error) { console.error("Error track:", error); }
  };

  const handleDeleteMountain = async (id) => {
    if (confirm("Hapus gunung ini bwang? Semua jalur terkait mungkin ikut hilang.")) {
      const res = await fetch(`/api/mountains?id=${id}`, { method: "DELETE" });
      if (res.ok) { 
        alert("Terhapus!"); 
        fetchMountains(); 
        fetchTracks(); 
      }
    }
  };

  const handleDeleteTrack = async (id) => {
    if (confirm("Hapus jalur ini bwang?")) {
      const res = await fetch(`/api/tracks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Jalur berhasil dihapus!");
        fetchTracks();
      }
    }
  };

  const handleDeleteBooking = async (id, code) => {
    if (confirm(`Hapus booking #${code} ini bwang? Data yang dihapus tidak bisa balik lagi.`)) {
      try {
        const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Booking berhasil dihapus!");
          fetchBookings();
        } else {
          alert("Gagal menghapus booking.");
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const handleCheckOut = async (code) => {
    if (!confirm(`Konfirmasi pendaki dengan kode #${code} sudah turun dan sampah aman?`)) return;
    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "finish" }) 
      });
      const result = await res.json();
      if (result.success) {
        alert("Check-out Berhasil! Kuota jalur otomatis pulih bwang. 🏁");
        fetchBookings(); 
      } else {
        alert("Gagal update status: " + result.error);
      }
    } catch (error) {
      console.error("Error check-out:", error);
    }
  };

  // --- LOGIC BARU: REDIRECT KE BIODATA ---
  const handleViewUser = (userId) => {
    if(!userId) return alert("ID User tidak ditemukan bwang!");
    router.push(`/admin/users/${userId}`);
  };

useEffect(() => {
  const isAdmin = localStorage.getItem("isAdmin");
  const adminData = localStorage.getItem("adminUser"); 

  if (!isAdmin) {
    router.replace("/login"); 
  } else {
    const adminObj = JSON.parse(adminData || "{}");
    setAdminName(adminObj.nama_lengkap || "Admin");
    
    fetchMountains();
    fetchTracks();
    fetchBookings();
    fetchAllPendaki();
  }
}, [router]);

  const handleLogout = () => {
    if (confirm("Yakin mau keluar bwang?")) {
      localStorage.removeItem("isAdmin");
      router.push("/login");
    }
  };

  // --- FILTERING LOGIC ---
  const filteredMountains = (mountains || []).filter(m => 
    (m.name || "").toLowerCase().includes(searchMountain.toLowerCase())
  );
  const filteredTracks = (tracks || []).filter(t => 
    (t.track_name || "").toLowerCase().includes(searchTrack.toLowerCase())
  );
  const filteredBookings = (bookings || []).filter(b => {
    const searchStr = searchBooking.toLowerCase();
    const leader = (b.user_name || b.leader_name || b.nama_lengkap || "").toLowerCase();
    const code = (b.verification_code || "").toLowerCase();
    return leader.includes(searchStr) || code.includes(searchStr);
  });

  // LOGIC FILTER MANIFEST (SEKARANG MENGGUNAKAN allPendaki SUPAYA SEMUA MEMBER MUNCUL)
  const filteredManifests = (allPendaki || []).filter(p => {
    const searchStr = searchManifest.toLowerCase();
    const name = (p.nama_lengkap || p.nama || "").toLowerCase();
    const nik = (p.nik_nisn || p.nik || "").toLowerCase();
    const email = (p.email || "").toLowerCase();
    return name.includes(searchStr) || nik.includes(searchStr) || email.includes(searchStr);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900 font-sans bg-[#fefce8] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-10 rounded-[3rem] shadow-xl border border-yellow-100 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800 leading-none">Admin Control Center ⚡</h1>
          <p className="text-slate-400 font-medium italic mt-3 text-sm">
            Selamat bertugas, <span className="text-emerald-600 font-black tracking-wide">Commander {adminName}</span>.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/admin/add" className="bg-emerald-600 hover:bg-slate-900 text-white font-black py-4 px-8 rounded-2xl text-[11px] uppercase shadow-lg transition-all active:scale-95 tracking-widest">
            + Gunung
          </Link>
          <Link href="/admin/add-track" className="bg-blue-600 hover:bg-slate-900 text-white font-black py-4 px-8 rounded-2xl text-[11px] uppercase shadow-lg transition-all active:scale-95 tracking-widest">
            + Jalur
          </Link>

          <button onClick={handleLogout} className="bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white font-black py-4 px-8 rounded-2xl text-[11px] uppercase transition-all active:scale-95 tracking-widest">
            Logout
          </button>
        </div>
      </div>

      {/* --- TAB NAVIGATION BUTTONS --- */}
      <div className="flex justify-center gap-3 mb-10 bg-white/50 p-2 rounded-[2.5rem] backdrop-blur-sm border border-white/20">
        <button onClick={() => setActiveTab("mountains")} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${activeTab === 'mountains' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-emerald-50'}`}>⛰️ Gunung</button>
        <button onClick={() => setActiveTab("tracks")} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${activeTab === 'tracks' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-blue-50'}`}>🚩 Jalur</button>
        <button onClick={() => setActiveTab("bookings")} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-orange-50'}`}>🎟️ E-Ticket</button>
        <button onClick={() => setActiveTab("manifest")} className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${activeTab === 'manifest' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:bg-emerald-50'}`}>👥 pendaki</button>
      </div>

      {/* --- KONTEN TAB: GUNUNG --- */}
      {activeTab === "mountains" && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-6 gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Database Gunung</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Total: {mountains.length} Entries</p>
            </div>
            <div className="relative">
                <input type="text" placeholder="Cari gunung..." className="pl-10 pr-6 py-4 border-none rounded-2xl text-xs w-72 bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all shadow-md font-bold" onChange={(e) => setSearchMountain(e.target.value)} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🔍</span>
            </div>
          </div>
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Visual</th>
                  <th className="px-10 py-6">Info Gunung</th>
                  <th className="px-10 py-6">Deskripsi</th>
                  <th className="px-10 py-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
          {filteredMountains.map((m, index) => (
  <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors group">
    <td className="px-10 py-5">
      {m.image_url ? (
        <img 
          src={m.image_url} 
          alt={m.name} 
          className={`w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white transition-all duration-500 ease-in-out 
            group-hover:scale-125 
            ${index % 2 === 0 ? 'group-hover:rotate-12' : 'group-hover:-rotate-12'} 
            group-hover:shadow-2xl group-hover:z-10 relative`} 
        />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110">
          <span className="text-xl">🏔️</span>
        </div>
      )}
    </td>
    <td className="px-10 py-5">
      <p className="font-black uppercase text-slate-800 text-sm tracking-tight group-hover:text-emerald-600 transition-colors">{m.name}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase italic">📍 {m.location}</p>
    </td>
    <td className="px-10 py-5 text-slate-500 font-medium text-xs max-w-xs">
      <p className="line-clamp-2 italic opacity-70 group-hover:opacity-100 transition-opacity">"{m.description || "-"}"</p>
    </td>
    <td className="px-10 py-5 text-center">
      <div className="flex justify-center gap-3">
        <Link href={`/admin/edit/${m.id}`} className="bg-white text-blue-600 border border-blue-100 px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-blue-600 hover:text-white transition shadow-sm tracking-widest active:scale-90">Edit</Link>
        <button onClick={() => handleDeleteMountain(m.id)} className="bg-white text-red-500 border border-red-100 px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-red-500 hover:text-white transition shadow-sm tracking-widest active:scale-90">Hapus</button>
      </div>
    </td>
  </tr>
))}
              </tbody>
            </table>
          </div>
        </section>
      )}

{/* --- KONTEN TAB: JALUR --- */}
{activeTab === "tracks" && (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-6 gap-4">
      <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Jalur & Kuota</h2>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Filter jalur..." 
          className="pl-10 pr-6 py-4 border-none rounded-2xl text-xs w-72 bg-white outline-none focus:ring-4 ring-blue-500/10 transition-all shadow-md font-bold" 
          onChange={(e) => setSearchTrack(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🧭</span>
      </div>
    </div>
    
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
  <table className="w-full text-left">
    <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
      <tr>
        <th className="px-10 py-6">Destinasi</th>
        <th className="px-10 py-6">Nama Jalur</th>
        <th className="px-10 py-6">Sisa Kuota</th>
        <th className="px-10 py-6 text-center">Terisi </th>
        <th className="px-10 py-6">Tarif Layanan</th>
        <th className="px-10 py-6 text-center">Opsi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50">
      {filteredTracks.map((t) => {
        const sisaWD = (t.quota_weekday || 0) - (t.booked_weekday || 0);
        const sisaWE = (t.quota_weekend || 0) - (t.booked_weekend || 0);
        return (
          <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
            <td className="px-10 py-5 font-black text-emerald-600 uppercase text-[11px] tracking-wider">
              {t.mountain_name}
            </td>
            <td className="px-10 py-5 font-bold text-slate-500 italic">
              {t.track_name}
            </td>
            <td className="px-10 py-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sisaWD < 10 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                  <span className="font-black text-slate-700 text-xs">{sisaWD} WD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sisaWE < 10 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></span>
                  <span className="font-black text-slate-700 text-xs">{sisaWE} WE</span>
                </div>
              </div>
            </td>
            <td className="px-10 py-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-between w-24 bg-slate-100 px-2 py-1 rounded-md">
                  <span className="text-[9px] font-black text-slate-400 uppercase">WD</span>
                  <span className="font-bold text-slate-700 text-xs">{t.booked_weekday || 0}</span>
                </div>
                <div className="flex items-center justify-between w-24 bg-orange-50 px-2 py-1 rounded-md">
                  <span className="text-[9px] font-black text-orange-400 uppercase">WE</span>
                  <span className="font-bold text-orange-700 text-xs">{t.booked_weekend || 0}</span>
                </div>
              </div>
            </td>
            <td className="px-10 py-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-[8px] font-black text-slate-400">WD</span>
                  <span className="font-black text-slate-800 text-xs">Rp {Number(t.price_weekday || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-slate-100 pt-1">
                  <span className="w-5 text-[8px] font-black text-orange-400">WE</span>
                  <span className="font-black text-slate-800 text-xs">Rp {Number(t.price_weekend || 0).toLocaleString()}</span>
                </div>
              </div>
            </td>
            <td className="px-10 py-5 text-center">
              <div className="flex justify-center gap-2">
                <Link href={`/admin/edit-track/${t.id}`} className="bg-white text-blue-600 border border-blue-100 px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-blue-600 hover:text-white transition shadow-sm">Edit</Link>
                <button onClick={() => handleDeleteTrack(t.id)} className="bg-white text-red-500 border border-red-100 px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-red-500 hover:text-white transition shadow-sm">Hapus</button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
  </section>
)}

{/* --- KONTEN TAB: E-TICKET --- */}
{activeTab === "bookings" && (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-6 gap-4">
      <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">E-Ticket Pendaki</h2>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Cari Kode/Nama..." 
          className="pl-10 pr-6 py-4 border-none rounded-2xl text-xs w-72 bg-white outline-none focus:ring-4 ring-orange-500/10 transition-all shadow-md font-bold" 
          onChange={(e) => setSearchBooking(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🔍</span>
      </div>
    </div>
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
          <tr>
            <th className="px-10 py-6">Status</th>
            <th className="px-10 py-6">Kode</th>
            <th className="px-10 py-6">Ketua Rombongan</th>
            <th className="px-10 py-6">Tujuan</th>
            <th className="px-10 py-6 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredBookings.map((b) => {
            // Logika Penentuan Warna Status
            const currentStatus = (b.status || "PENDING").toLowerCase();
            let statusStyles = "";

            switch (currentStatus) {
              case "success":
                statusStyles = "bg-emerald-500 text-white border-emerald-600";
                break;
              case "canceled":
                statusStyles = "bg-red-500 text-white border-red-600";
                break;
              case "expired":
              case "finished":
                statusStyles = "bg-slate-400 text-white border-slate-500";
                break;
              case "pending":
                statusStyles = "bg-orange-500 text-white border-orange-600 animate-pulse";
                break;
              default:
                statusStyles = "bg-amber-400 text-slate-900 border-amber-500";
            }

            return (
              <tr key={b.id} className="hover:bg-orange-50/30 transition-colors group">
                <td className="px-10 py-6">
                  <span className={`px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.15em] border-b-2 shadow-sm ${statusStyles}`}>
                    {currentStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-10 py-6 font-mono font-black text-blue-600 text-sm italic">#{b.verification_code}</td>
                <td className="px-10 py-6">
                  <p className="font-black uppercase text-slate-700 text-sm">{b.user_name || b.leader_name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Total: {b.total_members || 1} Person</p>
                </td>
                <td className="px-10 py-6">
                  <p className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{b.mountain_name}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase italic">Jalur {b.track_name}</p>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex justify-center gap-3">
                    {currentStatus === "success" && (
                      <button onClick={() => handleCheckOut(b.verification_code)} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg hover:bg-slate-900 transition-all">🏁 Check Out</button>
                    )}
                    <Link href={`/riwayat/${b.verification_code}`} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-600 transition-all">Detail</Link>
                    <button onClick={() => handleDeleteBooking(b.id, b.verification_code)} className="bg-white text-red-500 border border-red-100 px-6 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-red-500 hover:text-white transition">Hapus</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
)}
{/* --- KONTEN TAB: MANIFEST / DATABASE MEMBER --- */}
{activeTab === "manifest" && (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-6 gap-4">
      <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Database Member Register</h2>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Cari NIK / Nama / Email..." 
          className="pl-10 pr-6 py-4 border-none rounded-2xl text-xs w-72 bg-white outline-none focus:ring-4 ring-emerald-500/10 transition-all shadow-md font-bold" 
          onChange={(e) => setSearchManifest(e.target.value)} 
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs">🔍</span>
      </div>
    </div>
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
          <tr>
            <th className="px-10 py-6">Nama & NIK</th>
            <th className="px-10 py-6 text-center">Posisi Lapangan</th>
            <th className="px-10 py-6 text-center">Status Akun</th>
            <th className="px-10 py-6 text-center">ID Akun</th>
            <th className="px-10 py-6 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredManifests.map((p) => {
            const isSuspended = p.status === 'suspended';
            // Logika Status Mendaki
            const isOnMountain = p.status_mendaki === 'on_mountain';
            
            return (
              <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-10 py-5">
                  <p className="font-black text-slate-800 uppercase text-[12px]">{p.nama_lengkap || p.nama}</p>
                  <p className="text-[10px] text-emerald-600 font-black tracking-widest mt-1">NIK: {p.nik_nisn || p.nik || "BELUM DIISI"}</p>
                </td>

                {/* KOLOM BARU: POSISI LAPANGAN */}
                <td className="px-10 py-5 text-center">
                  {isOnMountain ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase animate-bounce shadow-lg shadow-blue-200">
                        🏔️ Di Gunung
                      </span>
                      <span className="text-[7px] text-blue-400 font-bold uppercase italic tracking-tighter">Belum Turun</span>
                    </div>
                  ) : (
                    <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase">
                      🏠 Di Rumah
                    </span>
                  )}
                </td>
                
                <td className="px-10 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                    isSuspended 
                      ? 'bg-red-100 text-red-600 border-red-200' 
                      : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                  }`}>
                    {isSuspended ? "🔴 Suspended" : "🟢 Active"}
                  </span>
                </td>

                <td className="px-10 py-5 text-center">
                  <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    Member #{p.id}
                  </span>
                </td>
                <td className="px-10 py-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => router.push(`/admin/pendaki/${p.id}`)} 
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-600 transition shadow-sm active:scale-95"
                    >
                      Detail Biodata
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
)}
    </div>
  );
}