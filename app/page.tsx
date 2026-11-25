"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import HomeHero from "@/app/components/HomeHero";
import { supabase } from "@/lib/supabase";
import { instagramUrl, whatsappUrl } from "@/lib/contact-links";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_KEY, normalizeHomeContent, type HomeContent } from "@/lib/home-content";

const map = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";
const Arrow = () => <span aria-hidden="true">↗</span>;

function VisualImageActions({ heroImageCount }: { heroImageCount: number }) {
  const [image, setImage] = useState<{ area: string; index: number; top: number; left: number } | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("visual-edit")) return;
    const updateImage = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".visual-image-actions")) return;
      const element = target instanceof HTMLElement ? target.closest<HTMLImageElement>("img[data-cms-image-area]") : null;
      if (!element) { setImage(null); return; }
      const rect = element.getBoundingClientRect();
      const next = { area: element.dataset.cmsImageArea ?? "", index: Number(element.dataset.cmsImageIndex ?? 0), top: Math.max(8, rect.top + 8), left: Math.max(8, Math.min(rect.right - 80, window.innerWidth - 80)) };
      setImage((current) => current && current.area === next.area && current.index === next.index && current.top === next.top && current.left === next.left ? current : next);
    };
    const reposition = () => {
      const hovered = document.querySelector<HTMLImageElement>("img[data-cms-image-area]:hover");
      if (!hovered) return;
      const rect = hovered.getBoundingClientRect();
      setImage((current) => current ? { ...current, top: Math.max(8, rect.top + 8), left: Math.max(8, Math.min(rect.right - 80, window.innerWidth - 80)) } : current);
    };
    document.addEventListener("pointermove", updateImage);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointermove", updateImage);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, []);

  if (!image?.area) return null;
  const cannotDelete = image.area === "hero" && heroImageCount <= 1;
  const replaceImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) window.parent.postMessage({ type: "weskos-visual-photo-drop", file, area: image.area, index: image.index }, window.location.origin);
    event.currentTarget.value = "";
  };
  const deleteImage = () => {
    window.parent.postMessage({ type: "weskos-visual-photo-delete", area: image.area, index: image.index }, window.location.origin);
    setImage(null);
  };

  return <div className="visual-image-actions" style={{ top: image.top, left: image.left }}>
    <label className="visual-image-action" aria-label="Replace photo" title="Replace photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg><input type="file" accept="image/*" onChange={replaceImage}/></label>
    <button className="visual-image-action visual-image-delete" type="button" aria-label="Delete photo" title={cannotDelete ? "Keep at least one hero photo" : "Delete photo"} disabled={cannotDelete} onClick={deleteImage}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg></button>
  </div>;
}

export default function Home() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const email = content.contact.email;
  const whatsapp = whatsappUrl(content.contact.phone, "Hello Weskos Legal Co., I would like to ask about your legal services.");
  const instagram = instagramUrl(content.contact.instagram);
  const sectionPosition = (section: HomeContent["sectionOrder"][number]) => content.sectionOrder.indexOf(section);
  const photoStoryPhotos = [
    ...content.photos.gallery.map((src, imageIndex) => ({ src, area: "gallery" as const, imageIndex })),
    ...(content.photos.coastAndLocation ?? []).map((src, imageIndex) => ({ src, area: "coastAndLocation" as const, imageIndex })),
  ];

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
    const visualEdit = new URLSearchParams(window.location.search).has("visual-edit");
    if (!visualEdit) return;
    document.documentElement.dataset.visualEdit = "true";
    const onDoubleClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-cms-field]") : null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      target.dataset.cmsOriginal = target.innerText;
      target.contentEditable = "true";
      target.spellcheck = true;
      target.focus();
    };
    const onFocusOut = (event: FocusEvent) => {
      const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-cms-field][contenteditable=true]") : null;
      if (!target) return;
      target.contentEditable = "false";
      const value = target.innerText.replace(/\u00a0/g, " ").trim();
      if (value !== target.dataset.cmsOriginal) {
        window.parent.postMessage({ type: "weskos-visual-edit", field: target.dataset.cmsField, value }, window.location.origin);
      }
      delete target.dataset.cmsOriginal;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-cms-field][contenteditable=true]") : null;
      if (!target) return;
      if (event.key === "Escape") {
        target.innerText = target.dataset.cmsOriginal ?? target.innerText;
        target.blur();
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        target.blur();
      }
    };
    const onDragOver = (event: DragEvent) => {
      const image = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-cms-image-area]") : null;
      if (!image || !event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      image.classList.add("cms-drop-target");
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.target instanceof HTMLElement) event.target.closest<HTMLElement>("[data-cms-image-area]")?.classList.remove("cms-drop-target");
    };
    const onDrop = (event: DragEvent) => {
      const image = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-cms-image-area]") : null;
      const file = event.dataTransfer?.files?.[0];
      if (!image || !file || !file.type.startsWith("image/")) return;
      event.preventDefault();
      image.classList.remove("cms-drop-target");
      window.parent.postMessage({ type: "weskos-visual-photo-drop", file, area: image.dataset.cmsImageArea, index: Number(image.dataset.cmsImageIndex ?? 0) }, window.location.origin);
    };
    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);
    return () => {
      delete document.documentElement.dataset.visualEdit;
      document.removeEventListener("dblclick", onDoubleClick);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("drop", onDrop);
    };
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
    <VisualImageActions heroImageCount={content.heroImages.length}/>
    <SiteHeader content={content}/><HomeHero content={content} /><div className="homepage-sections"><section className="intro section-pad" id="about" data-home-section="intro" style={{order: sectionPosition("intro")}}><div className="intro-tag"><img className="passport-stack" src="/images/passport-stack.webp" alt=""/><span><span data-cms-field="copy.introTagLine1">{content.copy.introTagLine1}</span><br/><span data-cms-field="copy.introTagLine2">{content.copy.introTagLine2}</span></span></div><div className="intro-copy"><p className="eyebrow" data-cms-field="copy.introEyebrow">{content.copy.introEyebrow}</p><h2 data-cms-field="introTitle">{content.introTitle}</h2></div><div className="intro-text"><p data-cms-field="introBody">{content.introBody}</p><a className="text-link" href={instagram}><span data-cms-field="copy.introLinkText">{content.copy.introLinkText}</span> <Arrow /></a></div></section>
    <section className="legal-services" id="services" data-home-section="services" style={{order: sectionPosition("services")}}><div className="section-heading"><div><p className="eyebrow" data-cms-field="copy.servicesEyebrow">{content.copy.servicesEyebrow}</p><h2><span data-cms-field="copy.servicesHeadingLine1">{content.copy.servicesHeadingLine1}</span><br/><span data-cms-field="copy.servicesHeadingLine2">{content.copy.servicesHeadingLine2}</span></h2></div><p data-cms-field="copy.servicesLead">{content.copy.servicesLead}</p></div><div className="legal-service-grid">
      <article className="legal-service-card" id="service-business"><span className="legal-service-number">01</span><p className="eyebrow"><span data-cms-field="services[0].category">{content.services[0].category}</span></p><h3><span data-cms-field="services[0].title">{content.services[0].title}</span></h3><p><span data-cms-field="services[0].description">{content.services[0].description}</span></p><a href="/services/company-formation"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
      <article className="legal-service-card" id="service-permits"><span className="legal-service-number">02</span><p className="eyebrow"><span data-cms-field="services[1].category">{content.services[1].category}</span></p><h3><span data-cms-field="services[1].title">{content.services[1].title}</span></h3><p><span data-cms-field="services[1].description">{content.services[1].description}</span></p><a href="/services/business-permits"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
      <article className="legal-service-card" id="service-visa"><span className="legal-service-number">03</span><p className="eyebrow"><span data-cms-field="services[2].category">{content.services[2].category}</span></p><h3><span data-cms-field="services[2].title">{content.services[2].title}</span></h3><p><span data-cms-field="services[2].description">{content.services[2].description}</span></p><a href="/services/visa-immigration"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
      <article className="legal-service-card" id="service-due-diligence"><span className="legal-service-number">04</span><p className="eyebrow"><span data-cms-field="services[3].category">{content.services[3].category}</span></p><h3><span data-cms-field="services[3].title">{content.services[3].title}</span></h3><p><span data-cms-field="services[3].description">{content.services[3].description}</span></p><a href="/services/property-due-diligence"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
      <article className="legal-service-card" id="service-acquisition"><span className="legal-service-number">05</span><p className="eyebrow"><span data-cms-field="services[4].category">{content.services[4].category}</span></p><h3><span data-cms-field="services[4].title">{content.services[4].title}</span></h3><p><span data-cms-field="services[4].description">{content.services[4].description}</span></p><a href="/services/property-acquisition"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
      <article className="legal-service-card legal-service-feature" id="service-legal"><span className="legal-service-number">06</span><p className="eyebrow"><span data-cms-field="services[5].category">{content.services[5].category}</span></p><h3><span data-cms-field="services[5].title">{content.services[5].title}</span></h3><p><span data-cms-field="services[5].description">{content.services[5].description}</span></p><a href="/services/legal-consulting"><span data-cms-field="copy.serviceLinkText">{content.copy.serviceLinkText}</span> <Arrow /></a></article>
    </div></section>
    <section className="photo-story" data-home-section="photoStory" style={{order: sectionPosition("photoStory")}}><div className="photo-story-heading"><div><p className="eyebrow" data-cms-field="copy.photoStoryEyebrow">{content.copy.photoStoryEyebrow}</p><h2><span data-cms-field="copy.photoStoryTitleStart">{content.copy.photoStoryTitleStart}</span> <em data-cms-field="copy.photoStoryTitleEm">{content.copy.photoStoryTitleEm}</em></h2></div></div><div className="photo-grid">{photoStoryPhotos.map(({src, area, imageIndex}, index) => <figure className={`photo-item photo-item-${index + 1}`} key={`${src}-${index}`}><img data-cms-image-area={area} data-cms-image-index={imageIndex} src={src} alt={`${content.copy.photoStoryAltPrefix} ${index + 1}`} loading="lazy" decoding="async"/><figcaption data-cms-field="copy.photoStoryCaption">{content.copy.photoStoryCaption}</figcaption></figure>)}</div></section>
    <section className="manifesto" data-home-section="manifesto" style={{order: sectionPosition("manifesto")}}><div className="manifesto-image" data-service-reveal="image">{content.photos.manifesto && <img src={content.photos.manifesto} alt={content.copy.manifestoImageAlt} data-cms-image-area="manifesto" data-cms-image-index={0} loading="lazy" decoding="async"/>}<span className="image-caption"><span data-cms-field="copy.manifestoImageCaption">{content.copy.manifestoImageCaption}</span></span></div><div className="manifesto-copy"><p className="eyebrow light" data-cms-field="manifesto.eyebrow">{content.manifesto.eyebrow}</p><h2 data-cms-field="manifesto.title">{content.manifesto.title.split("\n").map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br/>}{line}</span>)}</h2><p data-cms-field="manifesto.body">{content.manifesto.body}</p><a className="button button-outline" href={whatsapp}><span data-cms-field="manifesto.buttonText">{content.manifesto.buttonText}</span> <Arrow /></a><div className="manifesto-stamp">{content.copy.manifestoStamp.map((line, index) => <span key={index} data-cms-field={"copy.manifestoStamp[" + index + "]"}>{line}</span>)}</div></div></section>
    <section className="visit section-pad" id="contact" data-home-section="contact" style={{order: sectionPosition("contact")}}><div className="visit-layout"><div className="visit-copy-block"><p className="eyebrow" data-cms-field="contact.eyebrow">{content.contact.eyebrow}</p><h2 data-cms-field="contact.title">{content.contact.title.split("\n").map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br/>}{line}</span>)}</h2><p className="visit-copy" data-cms-field="contact.body">{content.contact.body}</p><p className="visit-address" data-cms-field="contact.address">{content.contact.address}</p><a className="button button-dark" href={whatsapp}><span data-cms-field="contact.buttonText">{content.contact.buttonText}</span> <Arrow /></a></div><a className="visit-photo" href={map} aria-label={content.copy.mapAriaLabel}>{content.photos.storefront && <img src={content.photos.storefront} alt={content.copy.mapPhotoAlt} data-cms-image-area="storefront" data-cms-image-index={0} loading="lazy" decoding="async"/>}<span className="map-chip"><small data-cms-field="copy.mapEyebrow">{content.copy.mapEyebrow}</small><b><span data-cms-field="copy.mapTitle">{content.copy.mapTitle}</span> <Arrow /></b></span></a></div><div className="visit-contacts"><a href={whatsapp}><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8 8c.3-.5.6-.6.9-.6h.5l1 2c.1.3 0 .5-.1.7l-.6.6c.6 1.2 1.5 2 2.7 2.6l.7-.7c.2-.2.4-.2.7-.1l1.8.9c.3.2.4.3.3.6-.1.7-.8 1.3-1.5 1.5-1 .3-2.2-.2-3.4-.8-1.9-1-3.2-2.8-3.6-4.1-.3-1.1.1-2 .6-2.6Z"/></svg></span><b data-cms-field="copy.contactWhatsappLabel">{content.copy.contactWhatsappLabel}</b><small data-cms-field="contact.phone">{content.contact.phone}</small></a><a href={`mailto:${email}`}><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg></span><b data-cms-field="copy.contactEmailLabel">{content.copy.contactEmailLabel}</b><small data-cms-field="contact.email">{email}</small></a><a href={instagram} target="_blank" rel="noreferrer"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r=".8"/></svg></span><b data-cms-field="copy.contactInstagramLabel">{content.copy.contactInstagramLabel}</b><small data-cms-field="contact.instagram">{content.contact.instagram}</small></a></div></section></div>
    <SiteFooter contact={content.contact} services={content.services} copy={content.copy} logo={content.logo} />
  </main>;
}

