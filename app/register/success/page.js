"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fefce8] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl w-full max-w-2xl border-t-[16px] border-red-600 text-center relative overflow-hidden">
        
        {/* Efek Background Dekoratif */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-50 rounded-full opacity-50"></div>

        {/* Icon Jam Pasir Animasi */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="text-6xl animate-bounce">⏳</div>
            <div className="absolute -inset-4 bg-red-100 rounded-full -z-10 animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Tulisan Utama */}
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 mb-4">
          Pendaftaran Berhasil <span className="text-red-600 underline">Dikunci!</span>
        </h1>

        {/* Deskripsi */}
        <div className="space-y-4 mb-10">
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            Data koordinat <span className="text-red-600 font-black">GPS</span> dan dokumen dokumen abang sudah masuk ke meja <span className="italic">Igres (Admin System)</span>.
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
            Kami akan melakukan verifikasi lapangan secara digital. Silakan coba login secara berkala untuk mengecek status akun abang.
          </p>
        </div>

        {/* Tombol Action */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/login" 
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-red-600 transition shadow-xl active:scale-95"
          >
            Kembali ke Login
          </Link>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
            Mountary Security Protocol v.2026
          </p>
        </div>
      </div>
    </div>
  );
}