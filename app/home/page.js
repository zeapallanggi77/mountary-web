"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [featuredMountains, setFeaturedMountains] = useState([]);

  useEffect(() => {
    fetch("/api/mountains")
      .then((res) => res.json())
      .then((data) => setFeaturedMountains(data.slice(0, 3)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[85vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4">
            Mountary.
          </h1>
          <p className="text-emerald-400 font-bold text-xl uppercase tracking-[0.3em] mb-8">
            halo
          </p>
          <Link href="/explore" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black uppercase hover:bg-emerald-600 transition shadow-2xl inline-block">
            Cek Kuota Sekarang
          </Link>
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">Gunung Terpopuler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredMountains.map((m) => (
            <Link href={`/booking/${m.id}`} key={m.id} className="group border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition">
              <img src={m.image_url} className="h-64 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-black uppercase">{m.name}</h3>
                <p className="text-slate-500 text-sm">{m.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}