import type { ReactNode } from "react";
import SiteFooter from "@/app/components/SiteFooter";
import SiteHeader from "@/app/components/SiteHeader";

export type PolicySection = { title: string; content: ReactNode };

export default function PolicyPage({ title, intro, sections }: {
  title: string;
  intro: string;
  sections: PolicySection[];
}) {
  return <main className="policy-page">
    <SiteHeader />
    <div className="policy-shell">
      <nav className="policy-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/terms-of-service">Legal</a><span aria-hidden="true">/</span><span>{title}</span></nav>
      <header className="policy-header"><p className="eyebrow">WESKOS LEGAL CO. · KRUI, SUMATRA</p><h1>{title}</h1><p className="policy-intro">{intro}</p><p className="policy-date">LAST UPDATED · 27 OCTOBER 2026</p></header>
      <article className="policy-content">{sections.map((section, index) => <section key={section.title}><span className="policy-section-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{section.title}</h2>{section.content}</div></section>)}</article>
      <aside className="policy-contact"><div><p className="eyebrow">QUESTIONS ABOUT THIS PAGE?</p><h2>Talk to the Weskos team.</h2></div><a href="mailto:weskos.bventure@gmail.com">weskos.bventure@gmail.com <span aria-hidden="true">↗</span></a></aside>
    </div>
    <SiteFooter />
  </main>;
}
