"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function AdminDashboard() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("all"); 
  const [bookings, setBookings] = useState([]);
  const [allPendaki, setAllPendaki] = useState([]);
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState("bookings"); 
  const [searchBooking, setSearchBooking] = useState(""); 
  const [searchManifest, setSearchManifest] = useState(""); 
  
  const router = useRouter();

  // --- FETCH DATA UTAMA ---
  const fetchMountainData = async (adminObj) => {
    try {
      const isSystemAdmin = adminObj.role === "admin_sistem";
      // Jika admin_sistem, mountain_id dikosongkan agar API mengambil semua data
      const mId = isSystemAdmin ? "" : adminObj.mountain_id;
      
      // 1. Ambil tracks (Jika admin sistem, ambil semua tracks. Jika tidak, filter per gunung)
      const resT = await fetch(`/api/tracks${mId ? `?mountain_id=${mId}` : ''}`);
      const dataTracks = await resT.json();
      setTracks(Array.isArray(dataTracks) ? dataTracks : []);

      // 2. Fetch Tiket & Pendaki
      loadDataByTrack(mId, "all");
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const loadDataByTrack = async (mountainId, trackId) => {
    // Bangun URL secara dinamis
    let urlBooking = `/api/bookings?`;
    let urlPendaki = `/api/pendaki?`;

    const params = new URLSearchParams();
    
    // Jika ada mountainId (Admin Gunung), tambahkan ke params
    if (mountainId) params.append("mountain_id", mountainId);
    
    // Jika pilih jalur spesifik, tambahkan ke params
    if (trackId !== "all") params.append("track_id", trackId);

    urlBooking += params.toString();
    urlPendaki += params.toString();

    try {
      const [resB, resP] = await Promise.all([
        fetch(urlBooking),
        fetch(urlPendaki)
      ]);
      
      const dataB = await resB.json();
      const dataP = await resP.json();

      setBookings(Array.isArray(dataB) ? dataB : []);
      setAllPendaki(Array.isArray(dataP) ? dataP : []);
    } catch (err) {
      setBookings([]);
      setAllPendaki([]);
    }
  };

  // --- ACTIONS ---
  const handleTrackChange = (e) => {
    const trackId = e.target.value;
    setSelectedTrack(trackId);
    // Jika admin_sistem, mountain_id tetap kosong agar tidak memfilter gunung tertentu saat ganti jalur
    const mId = user.role === "admin_sistem" ? "" : user.mountain_id;
    loadDataByTrack(mId, trackId);
  };

  const handleCheckOut = async (code) => {
    if (!confirm(`Konfirmasi pendaki #${code} sudah turun?`)) return;
    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "finish" }) 
      });
      if (res.ok) {
        alert("Check-out Berhasil!");
        const mId = user.role === "admin_sistem" ? "" : user.mountain_id;
        loadDataByTrack(mId, selectedTrack); 
      }
    } catch (error) { console.error("Error checkout:", error); }
  };

  // --- AUTH LOAD ---
  useEffect(() => {
    const adminData = localStorage.getItem("adminUser"); 
    if (!adminData) {
      router.replace("/login"); 
    } else {
      const adminObj = JSON.parse(adminData);
      setUser(adminObj);
      fetchMountainData(adminObj); 
    }
  }, [router]);

  // --- FILTERING FRONTEND ---
  const filteredBookings = Array.isArray(bookings) 
    ? bookings.filter(b => 
        (b.user_name || "").toLowerCase().includes(searchBooking.toLowerCase()) || 
        (b.verification_code || "").toLowerCase().includes(searchBooking.toLowerCase())
      )
    : [];

  const filteredManifests = Array.isArray(allPendaki)
    ? allPendaki.filter(p => 
        (p.nama_lengkap || "").toLowerCase().includes(searchManifest.toLowerCase()) || 
        (p.verification_code || "").toLowerCase().includes(searchManifest.toLowerCase()) ||
        (p.nik_nisn || "").toLowerCase().includes(searchManifest.toLowerCase())
      )
    : [];

  if (!user) return <p className="p-10 text-center font-bold">Loading Boss...</p>;

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900 font-sans bg-[#f8fafc] min-h-screen">
      
      {/* HEADER & SELECTOR JALUR */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">
              {user.role === "admin_sistem" ? "Global Control Center ⚡" : `Control Center ${user.mountain_name || "Gunung"}`}
            </h1>
            <p className="text-slate-400 font-bold mt-2 italic">Petugas: {user.nama_lengkap} ({user.role})</p>
          </div>

          <div className="w-full md:w-72 bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-100">
            <label className="block text-[10px] font-black uppercase text-emerald-600 mb-2 px-2">Pilih Jalur Kelola:</label>
            <select 
              value={selectedTrack} 
              onChange={handleTrackChange}
              className="w-full bg-transparent font-black uppercase text-xs outline-none cursor-pointer"
            >
              <option value="all">Semua Jalur (Global)</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {user.role === "admin_sistem" ? `[${t.mountain_name || 'Gunung'}] ` : ""}Jalur {t.track_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="flex justify-center gap-3 mb-8">
        <button onClick={() => setActiveTab("bookings")} className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}>🎟️ E-Ticket {selectedTrack === 'all' ? 'Semua Jalur' : 'Jalur Terpilih'}</button>
        <button onClick={() => setActiveTab("manifest")} className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'manifest' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}>👥 Database Pendaki</button>
      </div>

      {/* KONTEN TIKET */}
      {activeTab === "bookings" && (
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-black uppercase text-slate-800 italic">Daftar Tiket Aktif</h2>
            <input type="text" placeholder="Cari Kode/Nama..." className="px-6 py-3 rounded-xl bg-slate-50 text-xs font-bold outline-none w-64" onChange={(e) => setSearchBooking(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white uppercase text-[9px] tracking-[0.2em]">
              <tr>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5">Kode</th>
                <th className="px-10 py-5">Ketua</th>
                <th className="px-10 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-[10px] font-black uppercase text-slate-300">Tidak ada data tiket bwang.</td></tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5">
                      <span className={`px-3 py-1 rounded-lg font-black text-[8px] uppercase ${b.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-orange-400 text-white'}`}>{b.status}</span>
                    </td>
                    <td className="px-10 py-5 font-mono font-black text-blue-600 text-xs">#{b.verification_code}</td>
                    <td className="px-10 py-5 font-black uppercase text-xs">
                      {b.user_name} 
                      <span className="block text-[8px] text-slate-400 mt-1 italic">
                        {user.role === 'admin_sistem' ? `${b.mountain_name} - ` : ""}Jalur: {b.track_name}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        {b.status === "success" && <button onClick={() => handleCheckOut(b.verification_code)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase hover:bg-emerald-700">🏁 Check Out</button>}
                        <Link href={`/riwayat/${b.verification_code}`} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase">Detail</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* KONTEN MANIFEST */}
      {activeTab === "manifest" && (
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-black uppercase text-slate-800 italic">Daftar Pendaki Lapangan</h2>
            <input type="text" placeholder="Cari NIK/Nama..." className="px-6 py-3 rounded-xl bg-slate-50 text-xs font-bold outline-none w-64" onChange={(e) => setSearchManifest(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white uppercase text-[9px] tracking-[0.2em]">
              <tr>
                <th className="px-10 py-5">Nama & NIK</th>
                <th className="px-10 py-5 text-center">Posisi</th>
                <th className="px-10 py-5 text-center">Status Akun</th>
                <th className="px-10 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredManifests.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-[10px] font-black uppercase text-slate-300">Manifest kosong bwang.</td></tr>
              ) : (
                filteredManifests.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5 font-black uppercase text-xs">
                      {p.nama_lengkap} 
                      <span className="block text-[8px] text-emerald-600 tracking-widest mt-1 italic">
                        NIK: {p.nik_nisn} {user.role === 'admin_sistem' ? `| ${p.mountain_name || ''}` : ""}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-center">
                      {p.status_mendaki === 'on_mountain' ? <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase animate-pulse">🏔️ Di Gunung</span> : <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase">🏠 Di Rumah</span>}
                    </td>
                    <td className="px-10 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase border ${p.status === 'suspended' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>{p.status || 'active'}</span>
                    </td>
                    <td className="px-10 py-5 text-center">
                      <button onClick={() => router.push(`/admin/pendaki/${p.id}`)} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black uppercase text-[8px]">Profil</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}