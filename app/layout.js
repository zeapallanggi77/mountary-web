import "./globals.css";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
    <body className="bg-[#F6F0D7] text-[#89986D] antialiased">
  <div className="max-w-[1280px] mx-auto">
    <Navbar />
    <main>{children}</main>
  </div>
</body>
    </html>
  );
}