"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExploreMountains() {
  const [mountains, setMountains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetch("/api/mountains")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMountains(data);
        } else {
          console.error("Data bukan array:", data);
        }
      });
  }, []);

  const filteredMountains = Array.isArray(mountains) ? mountains.filter((m) => {
    const matchSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = m.location?.toLowerCase().includes(filterLocation.toLowerCase());
    return matchSearch && matchLocation;
  }) : [];

  return (
    /* GANTI DISINI: bg-slate-50 -> bg-[#fefce8] */
    <div className="min-h-screen bg-[#fefce8] p-8 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Cari Gunung ⛰️</h1>
          <p className="text-slate-500 italic">Temukan puncak impianmu dengan fitur pencarian pintar Mountary.</p>
        </div>

        {/* SEARCH BAR & FILTER SECTION */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Cari nama gunung" 
              /* Menggunakan bg-white agar tetap kontras dengan bg krem halaman */
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-lg focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-lg font-medium bg-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="md:w-64 px-6 py-4 rounded-2xl border-none shadow-lg outline-none font-bold text-emerald-700 appearance-none bg-white cursor-pointer"
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">Semua Lokasi</option>
            <option value="jawa tengah">Jawa Tengah</option>
            <option value="jawa barat">Jawa Barat</option>
            <option value="jawa timur">Jawa Timur</option>
          </select>
        </div>

        {/* GRID DAFTAR GUNUNG */}
        {filteredMountains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredMountains.map((m) => (
              /* Border saya tipiskan agar tidak terlalu kaku di atas background krem */
              <div key={m.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-emerald-50/50 hover:shadow-2xl transition-all group animate-in fade-in zoom-in duration-500">
                <div className="relative h-60 w-full overflow-hidden">
                  <img 
                    src={m.image_url} 
                    alt={m.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-700 shadow-md uppercase">
                    📍 {m.location}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black uppercase mb-3 leading-none">{m.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 italic leading-relaxed">
                    "{m.description}"
                  </p>
                  
                  <Link 
                    href={`/explore/${m.id}`} 
                    className="block w-full text-center bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state juga disesuaikan agar tidak belang */
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-300">
            <p className="text-4xl mb-4">🏜️</p>
            <p className="text-xl font-bold text-slate-400">Gunung yang kamu cari tidak ditemukan...</p>
            <button 
              onClick={() => {setSearchTerm(""); setFilterLocation("");}} 
              className="mt-4 text-emerald-600 font-black hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}