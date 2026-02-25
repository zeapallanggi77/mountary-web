"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StatusPage() {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const email = localStorage.getItem("user_email");
      if (!email) {
        router.push("/login");
        return;
      }

      try {
        // API simpel untuk cek status terbaru
        const res = await fetch(`/api/auth/check-status?email=${email}`);
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        console.error("Gagal cek status");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Re-check tiap 5 detik biar kelihatan "Real-time" pas demo
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Checking Protocol...</div>;

  return (
    <div className="min-h-screen bg-[#fefce8] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl w-full max-w-xl text-center border-t-[16px] border-slate-900">
        
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 mb-6">
          Verifikasi <span className="text-red-600">Basecamp</span>
        </h2>

        {status === "pending" ? (
          <div className="space-y-6 animate-pulse">
            <div className="inline-block p-6 bg-yellow-100 rounded-full text-4xl mb-2">🔍</div>
            <p className="text-sm font-bold text-slate-600">
              Akun abang sedang dalam <span className="text-yellow-600 font-black">PROSES VERIFIKASI</span> oleh tim Igres.
            </p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
                Kami sedang mencocokkan titik koordinat GPS dengan data SK yang abang upload. Mohon tunggu ya bwang!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="inline-block p-6 bg-emerald-100 rounded-full text-4xl mb-2">✅</div>
            <p className="text-sm font-bold text-slate-600">
              Wih mantap bwang! Akun abang <span className="text-emerald-600 font-black">SUDAH AKTIF</span>.
            </p>
            <Link 
              href="/dashboard" 
              className="block w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-900 transition shadow-xl shadow-emerald-100"
            >
              Masuk ke Dashboard Utama
            </Link>
          </div>
        )}

        <button onClick={() => router.push("/login")} className="mt-8 text-[10px] font-black text-slate-300 uppercase hover:text-red-600 transition">
          Logout & Keluar
        </button>
      </div>
    </div>
  );
}