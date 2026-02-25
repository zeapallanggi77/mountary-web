"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase italic text-slate-400">Loading Form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // SEKARANG CUMA BUTUH SATU FILE: foto_identitas
  const [files, setFiles] = useState({
    foto_identitas: null,
  });

  const [formData, setFormData] = useState({
    nama_lengkap: "", email: "", username: "", password: "", confirmPassword: "",
    jenis_identitas: "KTP", nik_nisn: "", tgl_lahir: "", no_telp: "",
    no_darurat: "", jenis_kelamin: "Laki-laki", berat_badan: "",
    tinggi_badan: "", provinsi: "", kota: "", kecamatan: "",
    kelurahan: "", alamat: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["nik_nisn", "no_telp", "no_darurat", "berat_badan", "tinggi_badan"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, key) => {
    setFiles(prev => ({ ...prev, [key]: e.target.files[0] }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Password konfirmasi gak cocok!");

    setLoading(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => dataToSend.append(key, formData[key]));
      
      // Kirim file identitas saja
      if (files.foto_identitas) dataToSend.append("foto_identitas", files.foto_identitas);
      // foto_ktp sengaja tidak dikirim agar di DB jadi NULL/Kosong dulu
      
      const res = await fetch("/api/pendaki/register", {
        method: "POST",
        body: dataToSend,
      });      
      const data = await res.json();

      if (res.ok) {
        alert("Registrasi Berhasil!");
        router.push("/login");
      } else {
        alert(data.error || "Gagal daftar.");
      }
    } catch (err) {
      alert("Koneksi bermasalah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefce8] flex flex-col items-center justify-center p-6 py-20 font-sans">
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-5xl border-t-[12px] border-emerald-600">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800">Register Pendaki</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Sistem Administrasi Terpusat 🏔️</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          
          <SectionTitle title="A. Informasi Akun" color="text-emerald-600" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            <Input label="Username" name="username" value={formData.username} onChange={handleChange} />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
            <Input label="Konfirmasi Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <SectionTitle title="B. Identitas & Kontak" color="text-emerald-600" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-slate-400 ml-2 italic">Jenis Identitas</p>
              <select name="jenis_identitas" value={formData.jenis_identitas} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 ring-emerald-100">
                <option value="KTP">KTP</option>
                <option value="SIM">SIM</option>
                <option value="KARTU PELAJAR">KARTU PELAJAR</option>
              </select>
            </div>
            <Input label="NIK / NISN" name="nik_nisn" value={formData.nik_nisn} onChange={handleChange} />
            <Input label="Tanggal Lahir" type="date" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-slate-400 ml-2 italic">Jenis Kelamin</p>
              <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 ring-emerald-100">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <Input label="No. Telpon" name="no_telp" value={formData.no_telp} onChange={handleChange} />
            <Input label="No. Darurat" name="no_darurat" value={formData.no_darurat} onChange={handleChange} />
            <Input label="Berat Badan (KG)" name="berat_badan" value={formData.berat_badan} onChange={handleChange} />
            <Input label="Tinggi Badan (CM)" name="tinggi_badan" value={formData.tinggi_badan} onChange={handleChange} />
          </div>

          <SectionTitle title="C. Domisili Lengkap" color="text-emerald-600" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input label="Provinsi" name="provinsi" value={formData.provinsi} onChange={handleChange} />
            <Input label="Kota / Kabupaten" name="kota" value={formData.kota} onChange={handleChange} />
            <Input label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleChange} />
            <Input label="Kelurahan" name="kelurahan" value={formData.kelurahan} onChange={handleChange} />
            <div className="md:col-span-4">
              <Input label="Alamat Lengkap" name="alamat" value={formData.alamat} onChange={handleChange} />
            </div>
          </div>

          <SectionTitle title="D. Lampiran Identitas" color="text-emerald-600" />
          <div className="grid grid-cols-1 gap-6">
            <FileInput 
              label="Upload Scan KTP / SIM / Kartu Pelajar" 
              onChange={(e) => handleFileChange(e, 'foto_identitas')} 
              required={true} 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition text-white shadow-2xl bg-slate-900 hover:bg-emerald-600">
            {loading ? "MENYIMPAN DATA..." : "DAFTAR SEBAGAI PENDAKI"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">← Kembali ke Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ title, color }) {
  return (
    <div className="pt-4 border-b pb-2">
      <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{title}</p>
    </div>
  );
}

function FileInput({ label, onChange, required = false }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <p className="text-[9px] font-black uppercase text-slate-400 mb-2 italic">{label} {required && "*"}</p>
      <input type="file" onChange={onChange} className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white cursor-pointer" />
    </div>
  );
}

function Input({ label, type = "text", name, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase text-slate-400 ml-2 italic">{label}</p>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 ring-slate-200" required />
    </div>
  );
}