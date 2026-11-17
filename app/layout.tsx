import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.weskoslegalco.com"),
  title: "Weskos Legal Co. — Business, Property & Immigration Support",
  description: "Legal support for Indonesian and foreign clients: PT PMA and company setup, business permits, property matters, and visa extensions in Indonesia.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Weskos Legal Co.",
    title: "Weskos Legal Co. — Business, Property & Immigration Support",
    description: "Practical legal guidance for company setup, permits, property matters, and immigration in Indonesia.",
    images: [{ url: "/images/krui-bukit-barisan.webp", width: 1800, height: 783, alt: "Coast and green landscape around Krui, Indonesia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weskos Legal Co. — Business, Property & Immigration Support",
    description: "Practical legal guidance for company setup, permits, property matters, and immigration in Indonesia.",
    images: ["/images/krui-bukit-barisan.webp"],
  },
  // Keep one stable, square favicon URL for crawlers and browser tabs.
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.dataset.theme = localStorage.getItem("weskos-theme") === "dark" ? "dark" : "light"; } catch { document.documentElement.dataset.theme = "light"; }` }} /></head><body>{children}</body></html>;
}

