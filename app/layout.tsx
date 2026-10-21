import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Weskos Legal & Real Estate — Krui, Sumatra", description: "Local guidance for business setup, stay permits, and property matters in Krui, Pesisir Barat." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.dataset.theme = localStorage.getItem("weskos-theme") === "dark" ? "dark" : "light"; } catch { document.documentElement.dataset.theme = "light"; }` }} /></head><body>{children}</body></html>;
}
