import type { MetadataRoute } from "next";

const site = "https://www.weskoslegalco.com";
const pages = [
  "",
  "/insights",
  "/insights/product",
  "/insights/surf",
  "/services/company-formation",
  "/services/business-permits",
  "/services/visa-immigration",
  "/services/property-due-diligence",
  "/services/property-acquisition",
  "/services/legal-consulting",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
  "/photo-credits",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return pages.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/services/") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/services/") ? 0.8 : 0.6,
  }));
}
