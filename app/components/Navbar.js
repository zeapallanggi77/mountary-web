"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    const adminData = localStorage.getItem("adminUser");
    const savedUser = localStorage.getItem("pendakiUser");

    if (adminStatus && adminData) {
      setUser(JSON.parse(adminData));
      setIsAdmin(true);
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(false);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("pendakiUser");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-5 bg-[#F6F0D7]/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#C5D89D]/30">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
        <span className="text-2xl">⛰️</span>
        <span className="text-xl font-bold tracking-tight">Mountary</span>
      </Link>

      {/* MENU */}
      <div className="flex items-center gap-6 md:gap-8 text-sm font-semibold">
        <Link href="/" className={`transition-colors hover:text-[#89986D] ${pathname === "/" ? "text-[#89986D]" : "text-[#9CAB84]"}`}>
          Home
        </Link>

        <Link href="/explore" className={`transition-colors hover:text-[#89986D] ${pathname === "/explore" ? "text-[#89986D]" : "text-[#9CAB84]"}`}>
          Explore
        </Link>

        {/* LOGIKA ADMIN & PENDAKI */}
        {isAdmin ? (
          <div className="flex items-center gap-4">
          
            <Link
              href="/admin"
              className="bg-[#89986D] text-[#F6F0D7] px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#9CAB84] transition-all"
            >
              Dashboard {user?.nama_lengkap?.split(" ")[0] || "Petugas"}
            </Link>

            
          </div>
        ) : user ? (
          <div className="flex items-center gap-6">
            <Link href="/profile" className="bg-[#C5D89D]/40 px-5 py-2 rounded-full border border-[#C5D89D] hover:bg-[#C5D89D] transition-all">
              {user.nama_lengkap?.split(" ")[0]}
            </Link>
            <button onClick={handleLogout} className="text-[#9CAB84] hover:text-[#89986D] transition-colors">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[#9CAB84] hover:text-[#89986D] transition-colors">
              Masuk
            </Link>
            <Link href="/register?role=pendaki" className="bg-[#89986D] text-[#F6F0D7] px-6 py-2 rounded-full font-semibold hover:bg-[#9CAB84] transition-all">
              Daftar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}