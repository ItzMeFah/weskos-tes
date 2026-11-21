"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomeContent } from "@/lib/home-content";

const Arrow = () => <span aria-hidden="true">↓</span>;

export default function HomeHero({ content }: { content: HomeContent }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const orderedImages = useMemo(() => content.heroImages.map((src, imageIndex) => ({ src, imageIndex })), [content.heroImages]);
  const heroSequence = orderedImages;
  const nextHeroIndex = heroSequence.length ? (heroIndex + 1) % heroSequence.length : 0;

  useEffect(() => {
    if (!heroSequence.length) return;
    let timer: number;
    const advanceAfter = (index: number) => {
      timer = window.setTimeout(() => {
        const next = (index + 1) % heroSequence.length;
        setHeroIndex(next);
        advanceAfter(next);
      }, content.heroSlideIntervalSeconds * 1000);
    };

    setHeroIndex(0);
    advanceAfter(0);
    return () => window.clearTimeout(timer);
  }, [content.heroImages, content.heroSlideIntervalSeconds]);

  useEffect(() => {
    const phraseTimer = window.setInterval(() => setPhraseIndex((index) => (index + 1) % content.heroPhrases.length), content.heroPhraseIntervalSeconds * 1000);
    return () => window.clearInterval(phraseTimer);
  }, [content.heroPhrases.length, content.heroPhraseIntervalSeconds]);

  return <section className="hero hero-carousel" id="home">
    <div className="hero-slides" aria-hidden="true">
      {heroSequence.map((item, index) => {
        if (index !== heroIndex && index !== nextHeroIndex) return null;
        const isActive = index === heroIndex;
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
