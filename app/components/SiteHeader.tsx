"use client";

import { useEffect, useState } from "react";

const phone = "6282210631017";
const whatsapp = `https://wa.me/${phone}`;
const instagram = "https://instagram.com/weskos.legalservice";

function Icon({ name }: { name: "whatsapp" | "instagram" | "mail" | "moon" | "sun" }) {
  if (name === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.4 7.8c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.5l.8 1.9c.1.2 0 .4-.1.6l-.6.7c-.2.2-.2.3-.1.5.4.7 1 1.4 1.8 1.9.7.5 1.3.7 1.6.8.2.1.4 0 .5-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.4 0 .3-.2 1.1-.8 1.6-.5.5-1.2.7-1.8.6-.7-.1-1.7-.4-2.9-1.1-1.5-.9-2.7-2.1-3.4-3.1-.7-.9-1.2-2-1.2-2.8 0-.7.4-1.4.7-1.7Z"/></svg>;
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle className="icon-fill" cx="17.7" cy="6.7" r="1"/></svg>;
  if (name === "mail") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>;
  if (name === "moon") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>;
}

export default function SiteHeader() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("weskos-theme"); } catch { /* Theme still works for this session without storage. */ }
    const isDark = saved === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    setDark(isDark);
  }, []);
  function toggleTheme() {
    // Read the live document value so the control stays correct if the page
    // is restored from the back/forward cache or another script changes it.
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("weskos-theme", next ? "dark" : "light"); } catch { /* Keep the current session toggle functional. */ }
    setDark(next);
  }

  return <header className="site-header">
    <a href="/#home" className="site-brand" aria-label="Weskos Legal Co. home"><img src="/images/weskos-logo.png" alt="Weskos"/></a>
    <nav className="main-nav" aria-label="Main navigation">
      <a className="nav-link" href="/#home">Home</a>
      <a className="nav-link" href="/#services">Services</a>
      <a className="nav-link" href="/#about">About</a>
      <div className="nav-dropdown"><a className="nav-link" href="/insights" aria-haspopup="true">Insights</a><div className="nav-menu" aria-label="Insights pages"><a href="/insights/product">Product</a><a href="/insights/surf">Surf</a></div></div>
      <a className="nav-link" href="/#contact">Contact</a>
    </nav>
    <div className="header-actions" aria-label="Contact and appearance">
      <a href={whatsapp} aria-label="WhatsApp"><Icon name="whatsapp"/></a>
      <a href={instagram} aria-label="Instagram"><Icon name="instagram"/></a>
      <a href="mailto:weskossurf@gmail.com" aria-label="Email"><Icon name="mail"/></a>
      <span className="header-divider" aria-hidden="true"/>
      <button className="theme-toggle" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark} title={dark ? "Switch to light mode" : "Switch to dark mode"}><Icon name={dark ? "sun" : "moon"}/></button>
    </div>
  </header>;
}
