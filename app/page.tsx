"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { DEFAULT_HOME_CONTENT, HERO_SURF_IMAGES, HOME_CONTENT_KEY, HOME_CONTENT_STORAGE_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

const phone = "6282210631017";
const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Weskos Legal Co., I would like to ask about your legal services.")}`;
const instagram = "https://instagram.com/weskos.legalservice";
const map = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";
const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [heroIndex, setHeroIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const demo = localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    if (demo) {
      try { setContent(normalizeHomeContent(JSON.parse(demo))); } catch { /* Ignore stale local demo content. */ }
    }
    if (supabase) {
      void supabase.from("site_content").select("content").eq("id", HOME_CONTENT_KEY).maybeSingle()
        .then(({ data }) => { if (data?.content) setContent(normalizeHomeContent(data.content)); });
    }
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const showHeroVideo = Boolean(content.heroVideo) && videoAvailable && !prefersReducedMotion;
  const surfImageSet = new Set(HERO_SURF_IMAGES);
  const indexedHeroImages = content.heroImages.map((src, imageIndex) => ({ src, imageIndex }));
  const landscapeImages = indexedHeroImages.filter(({ src }) => !surfImageSet.has(src));
  const surfImages = indexedHeroImages.filter(({ src }) => surfImageSet.has(src));
  const videoSlideIndex = landscapeImages.length;
  const heroSequence: ({ type: "image"; src: string; imageIndex: number } | { type: "video" })[] = [
    ...landscapeImages.map(({ src, imageIndex }) => ({ type: "image" as const, src, imageIndex })),
    ...(showHeroVideo ? [{ type: "video" as const }] : []),
    ...surfImages.map(({ src, imageIndex }) => ({ type: "image" as const, src, imageIndex })),
  ];

  useEffect(() => {
    if (!heroSequence.length) return;
    let timer: number;
    const advanceAfter = (index: number) => {
      const isVideoSlide = showHeroVideo && index === videoSlideIndex;
      const duration = isVideoSlide ? content.heroVideoDurationSeconds : content.heroSlideIntervalSeconds;
      timer = window.setTimeout(() => {
        const next = (index + 1) % heroSequence.length;
        setHeroIndex(next);
        advanceAfter(next);
      }, duration * 1000);
    };

    setHeroIndex(0);
    advanceAfter(0);
    return () => window.clearTimeout(timer);
  }, [content.heroImages, content.heroSlideIntervalSeconds, content.heroVideoDurationSeconds, showHeroVideo, videoSlideIndex]);

  useEffect(() => {
    const phraseTimer = window.setInterval(() => setPhraseIndex((index) => (index + 1) % content.heroPhrases.length), 4000);
    return () => window.clearInterval(phraseTimer);
  }, [content.heroPhrases.length]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (showHeroVideo && heroIndex === videoSlideIndex) {
      video.currentTime = 0;
      void video.play().catch(() => setVideoAvailable(false));
    } else {
      video.pause();
    }
  }, [heroIndex, showHeroVideo, videoSlideIndex]);

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
      const siblings = Array.from(element.parentElement?.children ?? []);
      const index = siblings.indexOf(element);
      element.style.setProperty("--reveal-delay", `${Math.max(0, index) * 90}ms`);
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
    <section className="hero hero-carousel" id="home">
      <div className="hero-slides" aria-hidden="true">{heroSequence.map((item, index) => item.type === "video" ? <div key="hero-video" className={`hero-slide hero-video-slide ${index === heroIndex ? "is-visible" : ""}`}><video ref={heroVideoRef} className="hero-video" src={content.heroVideo} poster={content.heroImages[0]} muted playsInline preload="none" onError={() => setVideoAvailable(false)} /></div> : <div key={`${item.src}-${index}`} className={`hero-slide hero-slide-${item.imageIndex + 1} ${index === heroIndex ? "is-visible" : ""}`} style={{ backgroundImage: `url("${item.src}")` }} />)}</div>
      <div className="hero-shade" />
      <div className="hero-copy"><h1><span className="hero-title-line">{content.heroTitle}</span><span className="hero-phrase-line"><em key={phraseIndex} className="phrase-fade">{content.heroPhrases[phraseIndex]}</em></span></h1><div className="hero-actions"><a className="button button-lime" href="#services">See how we can help <span>↓</span></a></div></div>
      <div className="hero-note"><span>KRUI, PESISIR BARAT · INDONESIA</span></div>
    </section>
    <section className="intro section-pad" id="about"><div className="intro-tag"><img className="passport-stack" src="/images/passport-stack.png" alt=""/><span>BUSINESS · VISA<br/>PERMITS · PROPERTY</span></div><div className="intro-copy"><p className="eyebrow">WESKOS LEGAL CO.</p><h2>{content.introTitle}</h2></div><div className="intro-text"><p>{content.introBody}</p><a className="text-link" href={instagram}>Get to know Weskos <Arrow /></a></div></section>
    <section className="legal-services" id="services"><div className="section-heading"><div><p className="eyebrow">FOR LOCAL & INTERNATIONAL CLIENTS</p><h2>Clear guidance.<br/>A confident next step.</h2></div><p>From setting up a company to navigating property matters and permits, get practical support from a team that knows the area.</p></div><div className="legal-service-grid">
      <article className="legal-service-card" id="service-business"><span className="legal-service-number">01</span><p className="eyebrow">BUSINESS SETUP</p><h3>Company formation & PT PMA</h3><p>Set up a local company or establish a PT PMA for foreign investment, with guidance through the required steps.</p><a href="/services/company-formation">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-permits"><span className="legal-service-number">02</span><p className="eyebrow">LICENSING</p><h3>Business permits</h3><p>Help navigating business licenses, registrations, and ongoing legal administration in Indonesia.</p><a href="/services/business-permits">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-visa"><span className="legal-service-number">03</span><p className="eyebrow">IMMIGRATION · WNA</p><h3>Visa extensions</h3><p>Assistance for foreign nationals who need help understanding or extending their Indonesian visa or stay permit.</p><a href="/services/visa-immigration">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-due-diligence"><span className="legal-service-number">04</span><p className="eyebrow">PROPERTY</p><h3>Property due diligence</h3><p>Review documents and key considerations before purchasing property, with guidance for local and foreign clients.</p><a href="/services/property-due-diligence">Explore this service <Arrow /></a></article>
      <article className="legal-service-card" id="service-acquisition"><span className="legal-service-number">05</span><p className="eyebrow">PROPERTY</p><h3>Property acquisition</h3><p>Local support as you explore a property purchase and work through the applicable legal process.</p><a href="/services/property-acquisition">Explore this service <Arrow /></a></article>
      <article className="legal-service-card legal-service-feature" id="service-legal"><span className="legal-service-number">06</span><p className="eyebrow">LEGAL SUPPORT</p><h3>Legal solutions & disputes</h3><p>Get help understanding business or property matters and the possible next steps for your situation.</p><a href="/services/legal-consulting">Explore this service <Arrow /></a></article>
    </div></section>
    <section className="manifesto"><div className="manifesto-image" style={{ backgroundImage: `url("${content.photos.manifesto}")` }}><span className="image-caption">PESISIR BARAT · SOUTH SUMATRA</span></div><div className="manifesto-copy"><p className="eyebrow light">LOCAL KNOWLEDGE, PERSONAL GUIDANCE</p><h2>Understand the process.<br/>Move forward with confidence.</h2><p>Company setup, permits, property checks, or visa extensions can raise a lot of questions. Tell us what you are planning and our team will help you find a clear place to start.</p><a className="button button-outline" href={whatsapp}>Talk to our team <Arrow /></a><div className="manifesto-stamp">WESKOS<br/>KRUI<br/>INDONESIA</div></div></section>
    <section className="visit section-pad" id="contact"><div className="visit-layout"><div className="visit-copy-block"><p className="eyebrow">START WITH A CONVERSATION</p><h2>Let's talk about<br/>your plans in Krui.</h2><p className="visit-copy">Share what you are working toward. We can help you understand the next step.</p><p className="visit-address">Jl. Jaya Wijaya Kp. Jawa, Pesisir Tengah, Pesisir Barat, Lampung 34874</p><a className="button button-dark" href={whatsapp}>Message Weskos <Arrow /></a></div><a className="visit-photo" href={map} aria-label="Open Weskos location in Google Maps"><img src={content.photos.storefront} alt="Weskos location in Pesisir Barat"/><span className="map-chip"><small>GOOGLE MAPS · KRUI</small><b>Find Weskos in Pesisir Barat <Arrow /></b></span></a></div><div className="visit-contacts"><a href={whatsapp}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8 8c.3-.5.6-.6.9-.6h.5l1 2c.1.3 0 .5-.1.7l-.6.6c.6 1.2 1.5 2 2.7 2.6l.7-.7c.2-.2.4-.2.7-.1l1.8.9c.3.2.4.3.3.6-.1.7-.8 1.3-1.5 1.5-1 .3-2.2-.2-3.4-.8-1.9-1-3.2-2.8-3.6-4.1-.3-1.1.1-2 .6-2.6Z"/></svg></span><b>WhatsApp</b><small>+62 822 1063 1017</small></a><a href="mailto:weskossurf@gmail.com"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg></span><b>Email</b><small>weskossurf@gmail.com</small></a><a href={instagram} target="_blank" rel="noreferrer"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r=".8"/></svg></span><b>Instagram</b><small>@weskos.legalservice</small></a></div></section>
    <SiteFooter />
  </main>;
}

