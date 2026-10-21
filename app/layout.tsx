import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Weskos Legal Co. — Business, Property & Immigration Support", description: "Legal support for Indonesian and foreign clients: PT PMA and company setup, business permits, property matters, and visa extensions in Indonesia." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.dataset.theme = localStorage.getItem("weskos-theme") === "dark" ? "dark" : "light"; } catch { document.documentElement.dataset.theme = "light"; }` }} /></head><body>{children}</body></html>;
}
