"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

export default function LoginPage() {
  const [role, setRole] = useState("pendaki");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Tentukan endpoint berdasarkan role
    const endpoint = role === "admin" ? "/api/admin/login" : "/api/pendaki/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_email", data.user.email);

        if (role === "admin") {
          // Kunci buat Admin (sesuai Navbar & Dashboard)
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminUser", JSON.stringify(data.user)); 
          
          // Pakai window.location.href biar refresh total dan gak mental di Ngrok
          if (data.user.status === 'pending') {
            window.location.href = "/dashboard/status";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          // Kunci buat Pendaki (SESUAI NAVBAR: "pendakiUser")
          localStorage.removeItem("isAdmin");
          localStorage.setItem("pendakiUser", JSON.stringify(data.user)); 
          
          // LANGSUNG KE PROFILE BWANG!
          // window.location.href jauh lebih aman daripada router.push + reload
          window.location.href = "/profile";
        }
      } else {
        alert(data.error || "Gagal masuk bwang!");
      }
    } catch (err) {
      console.error("LOGIN_ERROR:", err);
      alert("Koneksi gagal bwang! Cek database atau internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefce8] flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-t-[12px] border-slate-900">
        
        <div className="text-center mb-10">
          <span className="text-4xl text-emerald-600 font-black">🏔️</span>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 mt-2">Mountary</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 italic ${role === 'admin' ? 'text-red-500' : 'text-slate-400'}`}>
              Login {role}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded-2xl border mb-4">
            <button 
              type="button"
              onClick={() => setRole("pendaki")}
              className={`py-3 rounded-xl font-black text-[10px] uppercase transition ${role === 'pendaki' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}
            >
              Pendaki
            </button>
            <button 
              type="button"
              onClick={() => setRole("admin")}
              className={`py-3 rounded-xl font-black text-[10px] uppercase transition ${role === 'admin' ? 'bg-white shadow text-red-600' : 'text-slate-400'}`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-slate-400 ml-2 italic">Username</p>
            <input
              type="text"
              placeholder="Masukkan username"
              className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 font-bold text-sm border border-slate-100 transition ${role === 'admin' ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`}
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-slate-400 ml-2 italic">Password</p>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 font-bold text-sm border border-slate-100 transition ${role === 'admin' ? 'focus:ring-red-500' : 'focus:ring-emerald-500'}`}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition shadow-lg active:scale-95 text-white mt-4 ${role === 'admin' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-emerald-600'}`}>
            {loading ? "SABAR..." : "Masuk"}
          </button>
        </form>

      </div>
    </div>
  );
}