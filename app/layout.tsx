import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Weskos Surf & Co — Boardriders Service", description: "Surf culture, apparel, boards, and boardriders service in Pesisir Barat, Lampung." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.dataset.theme = localStorage.getItem("weskos-theme") === "dark" ? "dark" : "light"; } catch { document.documentElement.dataset.theme = "light"; }` }} /></head><body>{children}</body></html>;
}
