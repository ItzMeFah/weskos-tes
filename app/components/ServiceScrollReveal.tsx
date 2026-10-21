"use client";

import { useEffect } from "react";

export default function ServiceScrollReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-service-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    targets.forEach((element) => {
      element.classList.add("service-reveal", `service-reveal-${element.dataset.serviceReveal ?? "text"}`);
      const siblings = Array.from(element.parentElement?.children ?? []);
      element.style.setProperty("--service-reveal-delay", `${Math.min(siblings.indexOf(element), 5) * 90}ms`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("service-revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("service-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
