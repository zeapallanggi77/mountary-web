"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
// Import Ikon Lucide
import { 
  ChevronRight, 
  Map, 
  Users, 
  Clock, 
  ShieldCheck, 
  Instagram, 
  Twitter, 
  Globe, 
  ArrowRight,
  MousePointer2
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F6F0D7] font-sans text-[#4A5533] selection:bg-[#9CAB84] selection:text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
<section className="relative h-[95vh] flex items-center justify-center overflow-hidden pb-12 md:pb-32">        {/* Container Gambar Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
            alt="Mountain Background"
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#89986D] via-[#89986D]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          {/* Badge Modern */}
          <div className="inline-flex items-center gap-2 bg-[#F6F0D7]/20 backdrop-blur-md border border-white/30 text-[#F6F0D7] px-4 md:px-6 py-2 rounded-full mb-6 md:border shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5D89D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5D89D]"></span>
            </span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">The Ultimate Adventure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[130px] font-black uppercase italic tracking-tighter leading-[0.9] md:leading-[0.8] mb-8 md:mb-10 text-[#F6F0D7] drop-shadow-2xl">
            JELAJAH <br />
            <span className="text-[#C5D89D]">RIMBA</span>
          </h1>

          <p className="text-sm md:text-xl font-medium text-[#F6F0D7]/90 max-w-xl mx-auto mb-10 md:mb-14 italic tracking-wide leading-relaxed px-4">
            Platform booking pendakian paling sat-set. <br className="hidden md:block"/>
            Urus izin muncak jadi se-estetik ini.
          </p>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center w-full px-4">
            <button
              onClick={() => router.push("/explore")}
              className="w-full md:w-auto group bg-[#4A5533] text-[#F6F0D7] px-10 md:px-12 py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase italic hover:bg-[#F6F0D7] hover:text-[#4A5533] transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 tracking-widest text-sm md:text-base"
            >
              <span>Mulai Mendaki</span>
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => document.getElementById('cara-booking').scrollIntoView({behavior: 'smooth'})}
              className="w-full md:w-auto group bg-white/10 backdrop-blur-md text-[#F6F0D7] border-2 border-white/20 px-10 md:px-12 py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase italic hover:bg-white/20 transition-all flex items-center justify-center gap-3 tracking-widest text-sm md:text-base"
            >
              <span>Panduan</span>
              <MousePointer2 size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
           <div className="w-[1px] h-8 md:h-12 bg-[#F6F0D7] animate-pulse"></div>
        </div>
      </section>

      {/* 2. STATS SECTION - Floating & Gak Kaku */}
      <section className="relative -mt-10 md:-mt-12 z-20 px-4 md:px-6 bg-[#89986D]">        
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(74,85,51,0.2)] border border-[#C5D89D]/20 p-8 md:p-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 gap-8 md:gap-12 text-center">
          <StatItem icon={<Map size={28} />} num="50+" label="Jalur Aktif" />
          <StatItem icon={<Clock size={28} />} num="24/7" label="Real-time" />
          <StatItem icon={<Users size={28} />} num="15K" label="Pendaki" />
          <StatItem icon={<ShieldCheck size={28} />} num="Safe" label="System" />
        </div>
      </section>

      {/* 3. STEP SECTION */}
      <section id="cara-booking" className="py-16 sm:py-20 md:py-40 px-6 bg-[#F6F0D7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-6 md:gap-8">
            <div className="max-w-2xl text-left">
              <span className="text-[#9CAB84] font-black tracking-[0.5em] uppercase text-[10px] mb-4 block">Process Flow</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-[#4A5533] leading-none">Siapkan <br/>Carrier-mu!</h2>
            </div>
            <p className="text-[#89986D] font-bold italic max-w-[280px] text-left md:text-right text-xs md:text-sm">
              Kami memangkas birokrasi kaku menjadi tiga langkah instan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <StepItem 
              number="01" 
              title="Cari Puncak" 
              desc="Pilih gunung impianmu dan cek sisa kuota secara live." 
            />
            <StepItem 
              number="02" 
              title="Input Data" 
              desc="Daftarkan rombonganmu. Pastikan semua data terverifikasi." 
              isActive={true}
            />
            <StepItem 
              number="03" 
              title="Get Ticket" 
              desc="E-Ticket resmi mendarat di profilmu. Siap berangkat!" 
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#4A5533] py-20 md:py-32 px-6 text-center text-[#F6F0D7] relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-12 md:text-white">Mountary.</h3>
          
          <div className="flex justify-center gap-8 md:gap-12 mb-16 md:mb-20">
            <SocialLink icon={<Instagram size={20} />} label="Instagram" />
            <SocialLink icon={<Twitter size={20} />} label="Twitter" />
            <SocialLink icon={<Globe size={20} />} label="Community" />
          </div>

          <p className="font-black italic uppercase tracking-[0.4em] md:tracking-[0.8em] opacity-40 text-[8px] md:text-[9px]">© 2026 Mountary • Born to Explore</p>
        </div>

        <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 text-[22vw] font-black text-white/[0.03] uppercase italic select-none pointer-events-none whitespace-nowrap leading-none">
          WILDLIFE
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}

function StatItem({ icon, num, label }) {
  return (
    <div className="group transition-all duration-500 hover:-translate-y-2">
      <div className="text-[#C5D89D] flex justify-center mb-4 md:mb-6 group-hover:scale-110 md:group-hover:scale-125 group-hover:text-[#89986D] transition-all duration-500">
        {icon}
      </div>
      <p className="text-2xl md:text-5xl font-black text-[#4A5533] tracking-tighter">{num}</p>
      <p className="text-[8px] md:text-[10px] font-black text-[#9CAB84] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2">{label}</p>
    </div>
  );
}

function StepItem({ number, title, desc, isActive = false }) {
  return (
    <div className={`group relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-2 transition-all duration-700 ${
      isActive 
      ? "bg-[#C5D89D] border-[#C5D89D] shadow-2xl scale-100 md:scale-105 z-10" 
      : "bg-white border-transparent hover:border-[#C5D89D]/50 shadow-xl hover:shadow-2xl"
    }`}>
      <span className={`text-6xl md:text-8xl font-black block mb-6 md:mb-10 italic transition-colors ${
        isActive ? "text-[#F6F0D7]/50" : "text-[#F6F0D7]"
      }`}>
        {number}
      </span>
      
      <div className="relative z-10 text-left">
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 italic text-[#4A5533]">{title}</h3>
        <p className={`font-bold leading-relaxed text-xs md:text-sm italic ${
          isActive ? "text-[#4A5533]/70" : "text-[#9CAB84]"
        }`}>
          {desc}
        </p>
      </div>
      
      <div className="hidden">
        <ArrowRight />
      </div>
    </div>
  );
}

function SocialLink({ icon, label }) {
  return (
    <a href="#" className="flex items-center gap-2 group">
      <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#F6F0D7] group-hover:text-[#4A5533] transition-all duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{label}</span>
    </a>
  );
}