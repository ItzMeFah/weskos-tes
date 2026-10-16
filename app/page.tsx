"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/app/components/SiteHeader";
import { supabase } from "@/lib/supabase";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_KEY, HOME_CONTENT_STORAGE_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

const phone = "6282210631017";
const whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Weskos, I would like to ask about your products and surf services.")}`;
const instagram = "https://instagram.com/weskos_surfco";
const map = "https://maps.app.goo.gl/YdS5ysiipLeA5PmXA";
const galleryLabels = ["Weskos surf essentials", "A day on the Krui coast", "Local surf culture", "Tropical Sumatera"];
const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [imageIndex, setImageIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(true);

  useEffect(() => {
    const demo = localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    if (demo) {
      try { setContent(normalizeHomeContent(JSON.parse(demo))); } catch { /* Ignore stale local demo content. */ }
    }
    if (supabase) {
      void supabase.from("site_content").select("content").eq("id", HOME_CONTENT_KEY).maybeSingle()
        .then(({ data }) => { if (data?.content) setContent(normalizeHomeContent(data.content)); });
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let imageTimer: number | undefined;
    setImageIndex(0);
    // Reduced-motion settings may skip autoplay and fades, but must not stop
    // the hero slideshow itself.
    setVideoVisible(!reducedMotion);
    const startSlideshow = () => {
      setVideoVisible(false);
      if (content.heroImages.length > 1) {
        imageTimer = window.setInterval(() => setImageIndex((index) => (index + 1) % content.heroImages.length), content.heroSlideIntervalSeconds * 1000);
      }
    };
    const videoTimer = window.setTimeout(startSlideshow, reducedMotion ? 0 : content.heroVideoDurationSeconds * 1000);
    const phraseTimer = window.setInterval(() => setPhraseIndex((index) => (index + 1) % content.heroPhrases.length), 4000);
    return () => { window.clearTimeout(videoTimer); if (imageTimer) window.clearInterval(imageTimer); window.clearInterval(phraseTimer); };
  }, [content.heroImages.length, content.heroPhrases.length, content.heroVideoDurationSeconds, content.heroSlideIntervalSeconds]);

  const gallery = content.photos.gallery.map((src, index) => ({ src, label: galleryLabels[index] ?? `Weskos surf moment ${String(index + 1).padStart(2, "0")}` }));

  return <main>
    <SiteHeader />
    <section className="hero hero-carousel" id="home">
      <div className="hero-slides" aria-hidden="true">{content.heroImages.map((src, index) => <div key={`${src}-${index}`} className={`hero-slide ${index === imageIndex ? "is-visible" : ""}`} style={{ backgroundImage: `url("${src}")` }} />)}</div>
      {videoVisible && content.heroVideo && <video className="hero-video" src={content.heroVideo} poster={content.heroImages[0]} autoPlay muted playsInline preload="auto" aria-hidden="true" onError={() => setVideoVisible(false)} />}
      <div className="hero-shade" />
      <div className="hero-copy"><p className="eyebrow light">WESKOS SURF & CO · KRUI, SUMATRA</p><h1>{content.heroTitle}<br/><em key={phraseIndex} className="phrase-fade">{content.heroPhrases[phraseIndex]}</em></h1><p className="hero-sub">{content.heroLead}</p><div className="hero-actions"><a className="button button-lime" href="#shop">Explore Weskos <span>↓</span></a><a className="text-link light-link" href={map}>Find our shop <Arrow /></a></div></div>
      <div className="hero-note"><span>04°55′ S · 103°28′ E</span><span>KRUI, PESISIR BARAT · INDONESIA</span></div>
    </section>
    <section className="intro section-pad" id="story"><div className="intro-tag"><img className="surfboard-stencil" src={content.photos.boardArtwork} alt="Weskos surfboard stencil artwork"/><span>BUILT FOR<br/>THE BOARD LIFE</span></div><div className="intro-copy"><p className="eyebrow">A LOCAL SURF HOME</p><h2>{content.introTitle}</h2></div><div className="intro-text"><p>{content.introBody}</p><a className="text-link" href={instagram}>Follow our sessions <Arrow /></a></div></section>
    <section className="shop-section" id="shop"><div className="section-heading"><div><p className="eyebrow">GEAR UP, GET OUT</p><h2>Ready for your<br/>next session?</h2></div><p>Surf essentials and everyday apparel for days spent closer to the sea.</p></div><div className="cards">
      <a className="shop-card" href={whatsapp} style={{ backgroundImage: `linear-gradient(0deg, rgba(9,16,17,.75), transparent 65%), url("${content.photos.apparel}")` }}><span className="card-index">01 / APPAREL</span><span className="card-bottom"><span><b>Wear the coast.</b><small>Tees, caps & everyday essentials</small></span><span className="circle-arrow"><Arrow /></span></span></a>
      <a className="shop-card" href={whatsapp} style={{ backgroundImage: `linear-gradient(0deg, rgba(9,16,17,.72), transparent 65%), url("${content.photos.surfGoods}")` }}><span className="card-index">02 / SURF GOODS</span><span className="card-bottom"><span><b>Find your flow.</b><small>Surf goods & local picks</small></span><span className="circle-arrow"><Arrow /></span></span></a>
      <div className="service-card"><span className="service-icon">〰</span><p className="eyebrow">BOARD / BEACH / COMMUNITY</p><h3>It all starts with a love for the ocean.</h3><p>Ask us about gear, surf essentials, or our favourite local breaks. We are happy to help.</p><a className="text-link" href={whatsapp}>Talk to the Weskos crew <Arrow /></a></div>
    </div></section>
    <section className="photo-story"><div className="photo-story-heading"><p className="eyebrow">FROM OUR COAST, WITH LOVE</p><h2>Good days leave<br/><em>good stories.</em></h2></div><div className="photo-grid">{gallery.map((photo, index) => <figure className={`photo-item photo-item-${index + 1}`} key={photo.src}><img src={photo.src} alt={photo.label} loading="lazy"/><figcaption>{photo.label}</figcaption></figure>)}</div></section>
    <section className="manifesto"><div className="manifesto-image" style={{ backgroundImage: `url("${content.photos.manifesto}")` }}><span className="image-caption">WESKOS BOARD-RIDERS SERVICE · KRUI</span></div><div className="manifesto-copy"><p className="eyebrow light">OUR LITTLE CORNER OF THE COAST</p><h2>A place to meet,<br/>share stories, and<br/><em>head for the sea.</em></h2><p>Drop by, gear up, and get back to what matters most: enjoying your day by the coast.</p><a className="button button-outline" href={map}>Visit the shop <Arrow /></a><div className="manifesto-stamp">LOCAL<br/>SURF<br/>CULTURE</div></div></section>
    <section className="visit section-pad" id="visit"><div className="visit-layout"><div className="visit-copy-block"><p className="eyebrow">COME SAY HELLO</p><h2>See you in<br/>Pesisir Barat.</h2><p className="visit-copy">Stop by the shop or get in touch about stock, sizing, and surf services.</p><p className="visit-address">Jl. Jaya Wijaya Kp. Jawa, Pesisir Tengah, Pesisir Barat, Lampung 34874</p></div><a className="visit-photo" href={map} aria-label="Open Weskos location in Google Maps"><img src={content.photos.storefront} alt="Weskos Surf & Co storefront in Pesisir Barat"/><span className="map-chip"><small>GOOGLE MAPS · LIVE DIRECTIONS</small><b>Find Weskos in Krui <Arrow /></b></span></a></div><div className="visit-contacts"><a href={whatsapp}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8 8c.3-.5.6-.6.9-.6h.5l1 2c.1.3 0 .5-.1.7l-.6.6c.6 1.2 1.5 2 2.7 2.6l.7-.7c.2-.2.4-.2.7-.1l1.8.9c.3.2.4.3.3.6-.1.7-.8 1.3-1.5 1.5-1 .3-2.2-.2-3.4-.8-1.9-1-3.2-2.8-3.6-4.1-.3-1.1.1-2 .6-2.6Z"/></svg></span><b>WhatsApp</b><small>+62 822 1063 1017</small></a><a href="mailto:weskossurf@gmail.com"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg></span><b>Email</b><small>weskossurf@gmail.com</small></a><a href={instagram}><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r=".8"/></svg></span><b>Instagram</b><small>@weskos_surfco</small></a></div></section>
    <footer className="footer"><a href="#home" className="footer-logo"><img src="/images/weskos-logo.png" alt="Weskos" /></a><span>BOARD LIFE, PESISIR STYLE.</span><span>© 2026 Weskos Surf & Co</span><a href="/backoffice">ADMIN</a><a href={instagram}>INSTAGRAM <Arrow /></a></footer>
  </main>;
}
