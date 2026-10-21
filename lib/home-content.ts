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
  heroTitle: "Build in Krui.",
  heroPhrases: ["Start your business with clarity.", "Make your next move with confidence.", "Know the land before you sign.", "Find your footing in Indonesia."],
  heroLead: "Local guidance for business setup, stay permits, and property matters in Krui, Pesisir Barat.",
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
  introTitle: "Good decisions start with local knowledge.",
  introBody: "From business setup and stay permits to land due diligence, Weskos helps you understand the steps behind making Krui your next chapter.",
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
    heroTitle: value?.heroTitle === "Ride the coast." ? DEFAULT_HOME_CONTENT.heroTitle : value?.heroTitle ?? DEFAULT_HOME_CONTENT.heroTitle,
    heroLead: value?.heroLead?.startsWith("A home for boardriders on the edge of Sumatra.") ? DEFAULT_HOME_CONTENT.heroLead : value?.heroLead ?? DEFAULT_HOME_CONTENT.heroLead,
    introTitle: value?.introTitle === "Made for life on the coast." ? DEFAULT_HOME_CONTENT.introTitle : value?.introTitle ?? DEFAULT_HOME_CONTENT.introTitle,
    introBody: value?.introBody?.startsWith("Weskos is a local home for surf culture in Krui.") ? DEFAULT_HOME_CONTENT.introBody : value?.introBody ?? DEFAULT_HOME_CONTENT.introBody,
    heroPhrases: Array.isArray(value?.heroPhrases) && value.heroPhrases.length && !value.heroPhrases.every((phrase, index) => phrase === ["Live the culture.", "Find your line in Krui.", "Chase the southern swell.", "Salt air, local spirit."][index]) ? value.heroPhrases : DEFAULT_HOME_CONTENT.heroPhrases,
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
