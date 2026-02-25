"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DetailRiwayat() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem("isAdmin");
    if (adminAuth) setIsAdmin(true);

    fetch(`/api/bookings/detail?code=${params.code}`)
      .then((res) => res.json())
      .then((data) => {
        const urlParams = new URLSearchParams(window.location.search);
        const isPaidFromUrl = urlParams.get('status') === 'paid';

        if (data && data.status !== "finished" && data.status !== "canceled") {
          if (isPaidFromUrl || data.status === "" || data.status === "success") {
            data.status = "success";
          }
        }

        setBooking(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal ambil detail:", err);
        setLoading(false);
      });
  }, [params.code]);

  // --- TAMBAHAN: AUTO-REFRESH STATUS SAAT EXPIRED ---
  useEffect(() => {
    if (timeLeft === "WAKTU HABIS" && booking?.status?.toLowerCase() === "pending") {
      // Maksa tampilan berubah jadi EXPIRED tanpa nunggu refresh manual
      setBooking(prev => ({ ...prev, status: "expired" }));
    }
  }, [timeLeft, booking?.status]);

  const handleBack = () => {
    if (isAdmin) {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Yakin mau membatalkan booking ini bwang? Kuota akan dilepaskan kembali.")) return;

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: params.code, 
          action: "cancel" 
        }) 
      });
      const result = await res.json();
      
      if (result.success) {
        alert("Booking berhasil dibatalkan! Kuota jalur otomatis pulih bwang. 💨");
        window.location.reload(); 
      } else {
        alert("Gagal cancel: " + result.error);
      }
    } catch (error) {
      console.error("Error canceling:", error);
    }
  };

  // --- TIMER LOGIC (Directly using seconds_left) ---
  useEffect(() => {
    const currentStatus = booking?.status?.toLowerCase().trim();
    if (!booking || (currentStatus !== "pending" && currentStatus !== "")) return;

    let remainingSeconds = parseInt(booking.seconds_left);
    if (isNaN(remainingSeconds)) return;

    const timer = setInterval(() => {
      if (remainingSeconds <= 0) {
        setTimeLeft("WAKTU HABIS");
        clearInterval(timer);
      } else {
        const hours = Math.floor(remainingSeconds / 3600);
        const mins = Math.floor((remainingSeconds % 3600) / 60);
        const secs = remainingSeconds % 60;
        
        const displayTime = [
          hours.toString().padStart(2, '0'),
          mins.toString().padStart(2, '0'),
          secs.toString().padStart(2, '0')
        ].join(" : ");
        
        setTimeLeft(displayTime);
        remainingSeconds--;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  if (loading) return <div className="min-h-screen bg-[#fefce8] flex items-center justify-center font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Memuat Tiket... 🏔️</div>;
  if (!booking) return <div className="min-h-screen bg-[#fefce8] flex items-center justify-center font-black text-red-500 uppercase tracking-[0.3em]">Tiket Tidak Ditemukan ❌</div>;

  const cleanStatus = booking.status ? booking.status.toLowerCase().trim() : "";

  // UI UNTUK PENDING
  if (cleanStatus === "pending") {
    const isExpired = timeLeft === "WAKTU HABIS";
    return (
      <div className="min-h-screen bg-[#fefce8] flex flex-col items-center justify-center p-10 text-center">
        <div className="max-w-sm bg-white p-10 rounded-[3.5rem] shadow-2xl border border-yellow-100/50">
          <div className="text-7xl mb-6">{isExpired ? "⏰" : "⚠️"}</div>
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-slate-800">
            {isExpired ? "Waktu Habis!" : "Tiket Belum Aktif!"}
          </h1>
          <div className={`p-4 rounded-2xl mb-6 border-2 border-dashed ${isExpired ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200"}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isExpired ? "text-slate-400" : "text-red-400"}`}>
              {isExpired ? "Status Booking" : "Batas Waktu Pembayaran"}
            </p>
            <p className={`text-2xl font-mono font-black ${isExpired ? "text-slate-400" : "text-red-600"}`}>
              {timeLeft || "00 : 00 : 00"}
            </p>
          </div>
          
          <p className="text-slate-400 font-bold text-xs mb-8 italic leading-relaxed uppercase tracking-wider">
            {isAdmin 
              ? "Bookingan ini masih dalam status menunggu pembayaran bwang." 
              : (isExpired ? "Bookinganmu sudah hangus bwang." : "Selesaikan pembayaran sebelum waktu habis bwang.")}
          </p>

          {!isAdmin && !isExpired && (
            <div className="space-y-3">
              <Link href={`/checkout/${params.code}`} className="block w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                MENUJU PEMBAYARAN
              </Link>
              <button 
                onClick={handleCancel}
                className="block w-full py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-[10px] tracking-widest hover:bg-red-50 transition-all"
              >
                BATALKAN BOOKING
              </button>
            </div>
          )}

          {isExpired && !isAdmin && (
             <button onClick={() => router.push('/')} className="block w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl uppercase">
                Booking Ulang
             </button>
          )}
          
          <button onClick={handleBack} className="block w-full mt-6 text-[10px] font-black text-slate-500 uppercase hover:underline transition">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // UI UNTUK CANCELED / EXPIRED
 // --- BAGIAN BARU ---
if (cleanStatus === "canceled" || cleanStatus === "expired") {
  return (
    <div className="min-h-screen bg-[#fefce8] flex flex-col items-center justify-center p-10 text-center">
      <div className="max-w-sm bg-white p-10 rounded-[3.5rem] shadow-2xl border border-red-100">
        <div className="text-7xl mb-6">🚫</div>
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-red-600">Booking Batal</h1>
        <p className="text-slate-400 font-bold text-xs mb-8 italic uppercase tracking-wider">
          Booking dengan kode #{params.code} telah dibatalkan atau kedaluwarsa. Kuota sudah dikembalikan.
        </p>
        
        {/* Tombol yang sudah pintar menyesuaikan siapa yang klik */}
        <button 
          onClick={handleBack} 
          className="block w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-700 transition-all shadow-xl uppercase"
        >
          {isAdmin ? "KEMBALI KE ADMIN" : "KEMBALI KE BERANDA"}
        </button>

      </div>
    </div>
  );
}

  // UI UNTUK SUCCESS / FINISHED (TAMPILAN E-TICKET)
  const qrUrl = `https://quickchart.io/qr?text=${booking.verification_code}&size=200&dark=0f172a&margin=2`;
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#fefce8] p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-yellow-100/50">
        <div className={`${cleanStatus === "finished" ? "bg-slate-500" : "bg-emerald-600"} p-10 text-center text-white relative transition-colors`}>
          <h1 className="text-3xl font-black italic tracking-tighter">MOUNTARY</h1>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
            {cleanStatus === "finished" ? "Pendakian Selesai" : "E-Ticket Digital"}
          </p>
        </div>
        <div className="p-8 md:p-10 space-y-8 relative bg-white">
          <div className="flex flex-col items-center justify-center bg-[#fefce8]/30 p-8 rounded-[2.5rem] border-2 border-dashed border-yellow-200/50">
            <div className={`bg-white p-4 rounded-3xl shadow-lg mb-4 ${cleanStatus === "finished" ? "grayscale opacity-50" : ""}`}>
              <img src={qrUrl} alt="QR Code" className="w-44 h-44" />
            </div>
            <h2 className={`text-3xl font-black tracking-[0.4em] ml-3 ${cleanStatus === "finished" ? "text-slate-400 line-through" : "text-slate-800"}`}>
              {booking.verification_code}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <TicketInfo label="DESTINASI" value={booking.mountain_name} />
            <TicketInfo label="VIA JALUR" value={booking.track_name} />
            <TicketInfo label="LEADER" value={booking.user_name} />
            <TicketInfo label="KUOTA" value={`${booking.total_members} Orang`} />
            <TicketInfo label="CHECK-IN" value={formatDate(booking.booking_date)} />
            <TicketInfo label="CHECK-OUT" value={formatDate(booking.return_date)} />
            <TicketInfo label="TRIP TYPE" value={booking.trip_type?.toUpperCase()} />
            <TicketInfo 
              label="STATUS" 
              value={cleanStatus === "finished" ? "FINISHED & CLOSED" : "PAID & VALID"} 
              isStatus 
              isFinished={cleanStatus === "finished"}
            />
          </div>
        </div>
        <div className="bg-slate-900 p-8 text-center">
           <p className="text-white/40 text-[9px] uppercase font-black tracking-[0.2em]">
             {cleanStatus === "finished" ? "Data pendakian ini telah diarsipkan" : "Tunjukkan QR ke petugas basecamp"}
           </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 no-print w-full max-w-md">
        <button 
          onClick={handleBack} 
          className="flex-1 px-8 py-5 bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-slate-50 transition text-center active:scale-95"
        >
          Kembali {isAdmin && "ke Admin"}
        </button>
        {cleanStatus !== "finished" && (
          <button onClick={() => window.print()} className="flex-[1.5] px-8 py-5 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition active:scale-95">
            Print Ticket 📄
          </button>
        )}
      </div>
    </div>
  );
}

function TicketInfo({ label, value, isStatus, isFinished }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-sm font-black uppercase leading-tight ${
        isStatus 
          ? (isFinished ? 'text-slate-400' : 'text-emerald-600') 
          : 'text-slate-800'
      }`}>
        {value || "-"}
      </p>
    </div>
  );
}