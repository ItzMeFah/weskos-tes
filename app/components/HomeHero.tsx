"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HERO_OPENING_IMAGE_COUNT, type HomeContent } from "@/lib/home-content";

const Arrow = () => <span aria-hidden="true">↓</span>;

export default function HomeHero({ content }: { content: HomeContent }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const showHeroVideo = Boolean(content.heroVideo) && videoAvailable && !prefersReducedMotion;
  const orderedImages = useMemo(() => content.heroImages.map((src, imageIndex) => ({ src, imageIndex })), [content.heroImages]);
  const openingImages = orderedImages.slice(0, HERO_OPENING_IMAGE_COUNT);
  const remainingImages = orderedImages.slice(HERO_OPENING_IMAGE_COUNT);
  const heroSequence: ({ type: "image"; src: string; imageIndex: number } | { type: "video" })[] = [
    ...openingImages.map((item) => ({ type: "image" as const, ...item })),
    ...(showHeroVideo ? [{ type: "video" as const }] : []),
    ...remainingImages.map((item) => ({ type: "image" as const, ...item })),
  ];
  const videoSlideIndex = openingImages.length;
  const nextHeroIndex = heroSequence.length ? (heroIndex + 1) % heroSequence.length : 0;
  const firstHeroImage = content.heroImages[0] ?? "/images/krui-bukit-barisan.webp";

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
    const phraseTimer = window.setInterval(() => setPhraseIndex((index) => (index + 1) % content.heroPhrases.length), content.heroPhraseIntervalSeconds * 1000);
    return () => window.clearInterval(phraseTimer);
  }, [content.heroPhrases.length, content.heroPhraseIntervalSeconds]);

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

  return <section className="hero hero-carousel" id="home">
    <div className="hero-slides" aria-hidden="true">
      {heroSequence.map((item, index) => {
        if (index !== heroIndex && index !== nextHeroIndex) return null;
        const isActive = index === heroIndex;
        if (item.type === "video") return <div key="hero-video" className={`hero-slide hero-video-slide ${isActive ? "is-visible" : ""}`}>
          <video ref={heroVideoRef} className="hero-video" src={content.heroVideo} poster={firstHeroImage} muted playsInline preload="none" onError={() => setVideoAvailable(false)} />
        </div>;
        return <div key={`${item.src}-${index}`} className={`hero-slide hero-slide-${item.imageIndex + 1} ${isActive ? "is-visible" : ""}`}>
          <img src={item.src} alt="" data-cms-image-area="hero" data-cms-image-index={item.imageIndex} loading="eager" decoding="async" fetchPriority={isActive && index === 0 ? "high" : "low"}/>
        </div>;
      })}
    </div>
    <div className="hero-shade" />
    <div className="hero-copy"><h1><span className="hero-title-line" data-cms-field="heroTitle">{content.heroTitle}</span><span className="hero-phrase-line"><em key={phraseIndex} className="phrase-fade" data-cms-field={`heroPhrases[${phraseIndex}]`}>{content.heroPhrases[phraseIndex]}</em></span></h1><p className="hero-sub" data-cms-field="heroLead">{content.heroLead}</p><div className="hero-actions"><a className="button button-lime" href="#services"><span data-cms-field="copy.heroCta">{content.copy.heroCta}</span> <Arrow /></a></div></div>
    <div className="hero-note"><span data-cms-field="copy.heroLocation">{content.copy.heroLocation}</span></div>
  </section>;
}
