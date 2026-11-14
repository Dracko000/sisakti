import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiSAKTI — Sistem Administrasi Kelas & Aktivitas Terintegrasi SIBI",
  description:
    "Platform belajar yang mengintegrasikan perbukuan SIBI dengan kelas live, papan interaktif paperless, dan manajemen kelas terpadu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased text-[#334155] bg-[#f5f7fa]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
