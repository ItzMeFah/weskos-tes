export type HomeContent = {
  heroTitle: string;
  heroPhrases: string[];
  heroLead: string;
  heroVideo: string;
  heroVideoDurationSeconds: number;
  heroSlideIntervalSeconds: number;
  heroImages: string[];
  photos: {
    apparel: string;
    surfGoods: string;
    gallery: string[];
    boardArtwork: string;
    manifesto: string;
    storefront: string;
  };
  introTitle: string;
  introBody: string;
};

export const HOME_CONTENT_KEY = "home";
export const HOME_CONTENT_STORAGE_KEY = "weskos-demo-home";

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTitle: "Build with confidence.",
  heroPhrases: ["Set up your PT PMA with clarity.", "Make your business legal in Indonesia.", "Explore property with local guidance.", "Extend your stay with confidence."],
  heroLead: "Weskos Legal Co. helps Indonesian and foreign clients with company setup, permits, property matters, and visa extensions.",
  heroVideo: "/images/krui-surf-intro.mp4",
  heroVideoDurationSeconds: 4,
  heroSlideIntervalSeconds: 10,
  heroImages: ["/images/krui-coast-ride.jpg", "/images/wave-rider-wide.jpg", "/images/krui-wave-rider.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
  photos: {
    apparel: "/images/krui-coast-ride.jpg",
    surfGoods: "/images/krui-wave-rider.jpg",
    gallery: ["/images/wave-rider-wide.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg", "/images/barrel-session.jpg"],
    boardArtwork: "/images/surfboard-stencil-trio.png",
    manifesto: "/images/krui-coast-ride.jpg",
    storefront: "/images/storefront.jpeg",
  },
  introTitle: "Legal support for doing business in Indonesia.",
  introBody: "From setting up a local company or PT PMA to handling permits and reviewing a property purchase, Weskos Legal Co. supports both Indonesian clients and foreign nationals. We also assist foreign clients with visa extensions.",
};

export function normalizeHomeContent(value: Partial<HomeContent> | null | undefined): HomeContent {
  const seconds = (candidate: unknown, fallback: number, min: number, max: number) => {
    const number = Number(candidate);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
  };
  return {
    ...DEFAULT_HOME_CONTENT,
    ...value,
    // Move the original surf-first defaults forward while preserving any copy
    // the Weskos team has already customized in Supabase or demo storage.
    heroTitle: ["Ride the coast.", "Build in Krui.", "Make your next move."].includes(value?.heroTitle ?? "") ? DEFAULT_HOME_CONTENT.heroTitle : value?.heroTitle ?? DEFAULT_HOME_CONTENT.heroTitle,
    heroLead: value?.heroLead?.startsWith("A home for boardriders on the edge of Sumatra.") || value?.heroLead?.startsWith("Local guidance for business setup, stay permits, and property matters") || value?.heroLead?.startsWith("Legal and licensing support for local businesses") ? DEFAULT_HOME_CONTENT.heroLead : value?.heroLead ?? DEFAULT_HOME_CONTENT.heroLead,
    introTitle: ["Made for life on the coast.", "Good decisions start with local knowledge.", "One local partner for business, property, and permits."].includes(value?.introTitle ?? "") ? DEFAULT_HOME_CONTENT.introTitle : value?.introTitle ?? DEFAULT_HOME_CONTENT.introTitle,
    introBody: value?.introBody?.startsWith("Weskos is a local home for surf culture in Krui.") || value?.introBody?.startsWith("From business setup and stay permits to land due diligence") || value?.introBody?.startsWith("Weskos Legal Co. supports Indonesian clients and foreign nationals") ? DEFAULT_HOME_CONTENT.introBody : value?.introBody ?? DEFAULT_HOME_CONTENT.introBody,
    heroPhrases: Array.isArray(value?.heroPhrases) && value.heroPhrases.length && !value.heroPhrases.every((phrase, index) => phrase === ["Live the culture.", "Find your line in Krui.", "Chase the southern swell.", "Salt air, local spirit."][index] || phrase === ["Start your business with clarity.", "Make your next move with confidence.", "Know the land before you sign.", "Find your footing in Indonesia."][index] || phrase === ["Set up your company with clarity.", "Navigate property with local guidance.", "Handle permits with confidence.", "Plan your visa extension."][index]) ? value.heroPhrases : DEFAULT_HOME_CONTENT.heroPhrases,
    heroImages: Array.isArray(value?.heroImages) && value.heroImages.length && !value.heroImages.every((photo, index) => photo === ["/images/krui-wave-rider.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg"][index]) ? value.heroImages : DEFAULT_HOME_CONTENT.heroImages,
    heroVideoDurationSeconds: seconds(value?.heroVideoDurationSeconds, DEFAULT_HOME_CONTENT.heroVideoDurationSeconds, 0, 30),
    heroSlideIntervalSeconds: seconds(value?.heroSlideIntervalSeconds, DEFAULT_HOME_CONTENT.heroSlideIntervalSeconds, 3, 120),
    photos: {
      ...DEFAULT_HOME_CONTENT.photos,
      ...value?.photos,
      apparel: value?.photos?.apparel === "/images/apparel-rack.jpeg" ? DEFAULT_HOME_CONTENT.photos.apparel : value?.photos?.apparel ?? DEFAULT_HOME_CONTENT.photos.apparel,
      surfGoods: value?.photos?.surfGoods === "/images/store-products.jpeg" ? DEFAULT_HOME_CONTENT.photos.surfGoods : value?.photos?.surfGoods ?? DEFAULT_HOME_CONTENT.photos.surfGoods,
      manifesto: value?.photos?.manifesto === "/images/store-sign.jpeg" ? DEFAULT_HOME_CONTENT.photos.manifesto : value?.photos?.manifesto ?? DEFAULT_HOME_CONTENT.photos.manifesto,
      gallery: Array.isArray(value?.photos?.gallery) && !value.photos.gallery.every((photo, index) => photo === ["/images/weskos-surf-tee.jpg", "/images/krui-coast-ride.jpg", "/images/weskos-tshirt-art.jpg", "/images/tropical-sumatera-shirt.jpg"][index]) ? value.photos.gallery.filter((item): item is string => typeof item === "string") : DEFAULT_HOME_CONTENT.photos.gallery,
    },
  };
}
