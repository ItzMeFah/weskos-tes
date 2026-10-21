import type { ReactNode } from "react";
import SiteHeader from "@/app/components/SiteHeader";

export default function InsightsFrame({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <main className="insights-page">
    <SiteHeader />
    <header className="insights-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </header>
    {children}
    <footer className="insights-footer"><a href="/">← Weskos Legal Co.</a><a href="/insights/product">Product</a><a href="/insights/surf">Surf</a></footer>
  </main>;
}
