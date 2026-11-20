"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import HomeHero from "@/app/components/HomeHero";
import { supabase } from "@/lib/supabase";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

const map = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";
const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const phone = content.contact.phone.replace(/\D/g, "");
  const email = content.contact.email;
  const instagramHandle = content.contact.instagram.replace(/^@/, "");
  const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Weskos Legal Co., I would like to ask about your legal services.")}`;
  const instagram = `https://instagram.com/${instagramHandle}`;

  useEffect(() => {
    const isAdminPreview = new URLSearchParams(window.location.search).has("admin-preview");
    if (supabase && !isAdminPreview) {
      void supabase.from("site_content").select("content").eq("id", HOME_CONTENT_KEY).maybeSingle()
        .then(({ data }) => { if (data?.content) setContent(normalizeHomeContent(data.content)); });
    }
  }, []);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("admin-preview")) return;
    const receiveDraft = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "weskos-admin-preview") return;
      setContent(normalizeHomeContent(event.data.content));
    };
    window.addEventListener("message", receiveDraft);
    return () => window.removeEventListener("message", receiveDraft);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const revealTargets = document.querySelectorAll<HTMLElement>([
      ".intro-tag", ".intro-copy", ".intro-text", ".section-heading", ".legal-service-card",
      ".photo-story-heading", ".photo-item", ".manifesto-image", ".manifesto-copy",
      ".visit-copy-block", ".visit-photo", ".visit-contacts > a",
    ].join(","));

    revealTargets.forEach((element) => {
      element.classList.add("scroll-reveal");
      if (element.matches(".photo-item, .manifesto-image, .visit-photo, .intro-tag")) {
        element.classList.add("scroll-reveal-image");
      }
      const index = Array.prototype.indexOf.call(revealTargets, element) as number;
      element.style.setProperty("--reveal-delay", `${(index % 4) * 60}ms`);
    });

    document.documentElement.classList.add("scroll-reveal-ready");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

    revealTargets.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("scroll-reveal-ready");
    };
  }, []);

  return <main>
    <SiteHeader />
    <HomeHero content={content} />
    <section className="intro section-pad" id="about"><div className="intro-tag"><img className="passport-stack" src="/images/passport-stack.webp" alt=""/><span>BUSINESS · VISA<br/>PERMITS · PROPERTY</span></div><div className="intro-copy"><p className="eyebrow">WESKOS LEGAL CO.</p><h2>{content.introTitle}</h2></div><div className="intro-text"><p>{content.introBody}</p><a className="text-link" href={instagram}>Get to know Weskos <Arrow /></a></div></section>
    <section className="legal-services" id="services"><div className="section-heading"><div><p className="eyebrow">FOR LOCAL & INTERNATIONAL CLIENTS</p><h2>Clear guidance.<br/>A confident next step.</h2></div><p>From setting up a company to navigating property matters and permits, get practical support from a team that knows the area.</p></div><div className="legal-service-grid">
      <article className="legal-service-card" id="service-business"><span className="legal-service-number">01</span><p className="eyebrow">BUSINESS SETUP</p><h3>{content.services[0].title}</h3><p>{content.services[0].description}</p><a href="/services/company-formation">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-permits"><span className="legal-service-number">02</span><p className="eyebrow">LICENSING</p><h3>{content.services[1].title}</h3><p>{content.services[1].description}</p><a href="/services/business-permits">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-visa"><span className="legal-service-number">03</span><p className="eyebrow">IMMIGRATION · WNA</p><h3>{content.services[2].title}</h3><p>{content.services[2].description}</p><a href="/services/visa-immigration">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-due-diligence"><span className="legal-service-number">04</span><p className="eyebrow">PROPERTY</p><h3>{content.services[3].title}</h3><p>{content.services[3].description}</p><a href="/services/property-due-diligence">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-acquisition"><span className="legal-service-number">05</span><p className="eyebrow">PROPERTY</p><h3>{content.services[4].title}</h3><p>{content.services[4].description}</p><a href="/services/property-acquisition">Explore this service <Arrow /></a></article>
      <article className="legal-service-card legal-service-feature" id="service-legal"><span className="legal-service-number">06</span><p className="eyebrow">LEGAL SUPPORT</p><h3>{content.services[5].title}</h3><p>{content.services[5].description}</p><a href="/services/legal-consulting">Explore this service <Arrow /></a></article>
    </div></section>
    <section className="manifesto"><div className="manifesto-image" data-service-reveal="image"><img src={content.photos.manifesto} alt="Krui coastline" loading="lazy" decoding="async"/><span className="image-caption">PESISIR BARAT · SOUTH SUMATRA</span></div><div className="manifesto-copy"><p className="eyebrow light">{content.manifesto.eyebrow}</p><h2>{content.manifesto.title.split("\n").map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br/>}{line}</span>)}</h2><p>{content.manifesto.body}</p><a className="button button-outline" href={whatsapp}>{content.manifesto.buttonText} <Arrow /></a><div className="manifesto-stamp">WESKOS<br/>KRUI<br/>INDONESIA</div></div></section>
    <section className="visit section-pad" id="contact"><div className="visit-layout"><div className="visit-copy-block"><p className="eyebrow">{content.contact.eyebrow}</p><h2>{content.contact.title.split("\n").map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br/>}{line}</span>)}</h2><p className="visit-copy">{content.contact.body}</p><p className="visit-address">{content.contact.address}</p><a className="button button-dark" href={whatsapp}>{content.contact.buttonText} <Arrow /></a></div><a className="visit-photo" href={map} aria-label="Open Weskos location in Google Maps"><img src={content.photos.storefront} alt="Weskos location in Pesisir Barat" loading="lazy" decoding="async"/><span className="map-chip"><small>GOOGLE MAPS · KRUI</small><b>Find Weskos in Pesisir Barat <Arrow /></b></span></a></div><div className="visit-contacts"><a href={whatsapp}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8 8c.3-.5.6-.6.9-.6h.5l1 2c.1.3 0 .5-.1.7l-.6.6c.6 1.2 1.5 2 2.7 2.6l.7-.7c.2-.2.4-.2.7-.1l1.8.9c.3.2.4.3.3.6-.1.7-.8 1.3-1.5 1.5-1 .3-2.2-.2-3.4-.8-1.9-1-3.2-2.8-3.6-4.1-.3-1.1.1-2 .6-2.6Z"/></svg></span><b>WhatsApp</b><small>{content.contact.phone}</small></a><a href={`mailto:${email}`}><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg></span><b>Email</b><small>{email}</small></a><a href={instagram} target="_blank" rel="noreferrer"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r=".8"/></svg></span><b>Instagram</b><small>{content.contact.instagram}</small></a></div></section>
    <SiteFooter contact={content.contact} services={content.services} />
  </main>;
}

