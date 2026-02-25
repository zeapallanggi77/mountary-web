"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function MountainDetail() {
  const [mountain, setMountain] = useState(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/mountains")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((m) => m.id == params.id);
        setMountain(found);
      });
  }, [params.id]);

  const handleBookingClick = (e) => {
    const savedUser = localStorage.getItem("pendakiUser");
    if (!savedUser) {
      e.preventDefault();
      alert("Waduh bwang, login dulu ya biar bisa booking!");
      router.push("/login");
    }
  };

  if (!mountain) return <div className="p-20 text-center font-bold animate-pulse">Memuat Informasi Gunung... ⛰️</div>;

  return (
    <div className="min-h-screen bg-[#fefce8] text-slate-900 pb-20">
      
      {/* HEADER GAMBAR - h-[75vh] biar gak terlalu ke-crop parah */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <img 
          src={mountain.image_url} 
          className="w-full h-full object-cover object-center" 
          alt={mountain.name} 
        />
        {/* Gradient lebih smooth dari bawah */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-12">
          <div className="max-w-4xl mx-auto w-full mb-20">
            <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">{mountain.name}</h1>
            <p className="text-emerald-400 text-2xl font-bold italic mt-2">📍 {mountain.location}</p>
          </div>
        </div>
      </div>

      {/* ISI DESKRIPSI - rounded-[3rem] biar simetris atas bawah kiri kanan */}
      <div className="max-w-4xl mx-auto p-12 -mt-24 relative bg-white rounded-[4rem] shadow-2xl border border-slate-100">
        <div className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-2 bg-emerald-600 rounded-full"></div>
             <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Tentang Gunung Ini</h2>
          </div>
          <p className="text-slate-600 text-xl leading-relaxed whitespace-pre-line font-medium italic">
            "{mountain.description}"
          </p>
        </div>

        {/* BUTTON BOOKING */}
        <div className="mt-16 p-10 bg-[#fefce8] rounded-[3rem] border border-yellow-200 flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner">
          <div className="text-center md:text-left">
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mb-1">Siap Mendaki?</p>
            <p className="text-3xl font-black text-slate-800">Mulai Petualanganmu!</p>
          </div>
          <Link 
            href={`/booking/${mountain.id}`} 
            onClick={handleBookingClick}
            className="bg-slate-900 hover:bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 text-lg uppercase tracking-widest"
          >
            Booking Sekarang
          </Link>
        </div>

        {/* TOMBOL KEMBALI */}
        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <button 
                onClick={() => router.back()} 
                className="inline-flex items-center gap-2 text-slate-300 font-black text-[11px] uppercase tracking-[0.3em] hover:text-emerald-600 transition-all group"
            >
                <span className="group-hover:-translate-x-2 transition-transform inline-block">←</span> Kembali ke List Gunung
            </button>
        </div>
      </div>
    </div>
  );
}