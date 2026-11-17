import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/backoffice" },
    sitemap: "https://www.weskoslegalco.com/sitemap.xml",
    host: "https://www.weskoslegalco.com",
  };
}
