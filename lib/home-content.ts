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
  heroTitle: "Make your next move.",
  heroPhrases: ["Start your business with clarity.", "Know the land before you sign.", "Handle permits with local guidance.", "Plan your stay in Indonesia."],
  heroLead: "From company setup and permits to property and visa matters, get practical legal guidance rooted in Krui.",
  heroVideo: "/images/krui-surf-intro.mp4",
  heroVideoDurationSeconds: 4,
  heroSlideIntervalSeconds: 10,
  heroImages: ["/images/krui-bukit-barisan.jpg", "/images/pulau-pisang-coast.jpg", "/images/pesisir-green-fields.webp", "/images/pulau-pisang-view.jpg", "/images/krui-wave-rider.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
  photos: {
    apparel: "/images/weskos-local-team.jpg",
    surfGoods: "/images/fishing-day.jpg",
    gallery: ["/images/krui-coast-ride.jpg", "/images/krui-wave-rider.jpg", "/images/wave-rider-wide.jpg", "/images/air-surf-session.jpg"],
    boardArtwork: "/images/surfboard-stencil-trio.png",
    manifesto: "/images/krui-surf-turn.jpg",
    storefront: "/images/storefront.jpeg",
  },
  introTitle: "Local insight for your next move in Indonesia.",
  introBody: "Starting a company, sorting permits, exploring a property purchase, or extending your stay can bring a lot of questions. Weskos helps local and international clients understand the process and take the next step with confidence.",
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
    heroTitle: ["Ride the coast.", "Build in Krui.", "Build with confidence."].includes(value?.heroTitle ?? "") ? DEFAULT_HOME_CONTENT.heroTitle : value?.heroTitle ?? DEFAULT_HOME_CONTENT.heroTitle,
    heroLead: value?.heroLead?.startsWith("A home for boardriders on the edge of Sumatra.") || value?.heroLead?.startsWith("Local guidance for business setup, stay permits, and property matters") || value?.heroLead?.startsWith("Legal and licensing support for local businesses") || value?.heroLead?.startsWith("Weskos Legal Co. helps Indonesian and foreign clients") ? DEFAULT_HOME_CONTENT.heroLead : value?.heroLead ?? DEFAULT_HOME_CONTENT.heroLead,
    introTitle: ["Made for life on the coast.", "Good decisions start with local knowledge.", "One local partner for business, property, and permits.", "Legal support for doing business in Indonesia."].includes(value?.introTitle ?? "") ? DEFAULT_HOME_CONTENT.introTitle : value?.introTitle ?? DEFAULT_HOME_CONTENT.introTitle,
    introBody: value?.introBody?.startsWith("Weskos is a local home for surf culture in Krui.") || value?.introBody?.startsWith("From business setup and stay permits to land due diligence") || value?.introBody?.startsWith("Weskos Legal Co. supports Indonesian clients and foreign nationals") || value?.introBody?.startsWith("From setting up a local company or PT PMA") ? DEFAULT_HOME_CONTENT.introBody : value?.introBody ?? DEFAULT_HOME_CONTENT.introBody,
    heroPhrases: Array.isArray(value?.heroPhrases) && value.heroPhrases.length && ![
      ["Live the culture.", "Find your line in Krui.", "Chase the southern swell.", "Salt air, local spirit."],
      ["Start your business with clarity.", "Make your next move with confidence.", "Know the land before you sign.", "Find your footing in Indonesia."],
      ["Set up your company with clarity.", "Navigate property with local guidance.", "Handle permits with confidence.", "Plan your visa extension."],
      ["Set up your PT PMA with clarity.", "Make your business legal in Indonesia.", "Explore property with local guidance.", "Extend your stay with confidence."],
    ].some((legacy) => value.heroPhrases!.length === legacy.length && value.heroPhrases!.every((phrase, index) => phrase === legacy[index])) ? value.heroPhrases : DEFAULT_HOME_CONTENT.heroPhrases,
    heroImages: Array.isArray(value?.heroImages) && value.heroImages.length && ![
    ["/images/krui-coast-ride.jpg", "/images/wave-rider-wide.jpg", "/images/krui-wave-rider.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
      ["/images/krui-wave-rider.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg"],
      ["/images/krui-wave-rider.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
      ["/images/krui-bukit-barisan.jpg", "/images/pulau-pisang-coast.jpg", "/images/krui-wave-rider.jpg", "/images/pulau-pisang-beach.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
      ["/images/krui-bukit-barisan.jpg", "/images/pulau-pisang-coast.jpg", "/images/pulau-pisang-beach.jpg", "/images/pulau-pisang-view.jpg", "/images/krui-wave-rider.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg"],
    ].some((legacy) => value.heroImages!.length === legacy.length && value.heroImages!.every((photo, index) => photo === legacy[index]))
      ? DEFAULT_HOME_CONTENT.heroImages
      : Array.isArray(value?.heroImages) && value.heroImages.length
        ? value.heroImages.filter((photo) => typeof photo === "string" && !/instagram-krui-(surf|green)/i.test(photo)).length > 1
          ? value.heroImages.filter((photo) => typeof photo === "string" && !/instagram-krui-(surf|green)/i.test(photo)) as string[]
          : DEFAULT_HOME_CONTENT.heroImages
        : DEFAULT_HOME_CONTENT.heroImages,
    heroVideoDurationSeconds: seconds(value?.heroVideoDurationSeconds, DEFAULT_HOME_CONTENT.heroVideoDurationSeconds, 0, 30),
    heroSlideIntervalSeconds: seconds(value?.heroSlideIntervalSeconds, DEFAULT_HOME_CONTENT.heroSlideIntervalSeconds, 3, 120),
    photos: {
      ...DEFAULT_HOME_CONTENT.photos,
      ...value?.photos,
      apparel: ["/images/apparel-rack.jpeg", "/images/krui-coast-ride.jpg", "/images/instagram-krui-green.webp"].includes(value?.photos?.apparel ?? "") ? DEFAULT_HOME_CONTENT.photos.apparel : value?.photos?.apparel ?? DEFAULT_HOME_CONTENT.photos.apparel,
      surfGoods: ["/images/store-products.jpeg", "/images/krui-wave-rider.jpg", "/images/instagram-krui-surf.webp"].includes(value?.photos?.surfGoods ?? "") ? DEFAULT_HOME_CONTENT.photos.surfGoods : value?.photos?.surfGoods ?? DEFAULT_HOME_CONTENT.photos.surfGoods,
      manifesto: ["/images/store-sign.jpeg", "/images/krui-coast-ride.jpg", "/images/instagram-krui-green.webp"].includes(value?.photos?.manifesto ?? "") ? DEFAULT_HOME_CONTENT.photos.manifesto : value?.photos?.manifesto ?? DEFAULT_HOME_CONTENT.photos.manifesto,
      gallery: Array.isArray(value?.photos?.gallery) && ![
        ["/images/weskos-surf-tee.jpg", "/images/krui-coast-ride.jpg", "/images/weskos-tshirt-art.jpg", "/images/tropical-sumatera-shirt.jpg"],
        ["/images/wave-rider-wide.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg", "/images/barrel-session.jpg"],
      ].some((legacy) => value.photos!.gallery!.length === legacy.length && value.photos!.gallery!.every((photo, index) => photo === legacy[index]))
        ? DEFAULT_HOME_CONTENT.photos.gallery
        : Array.isArray(value?.photos?.gallery) && value.photos.gallery.length
          ? value.photos.gallery.filter((item): item is string => typeof item === "string" && !/instagram-krui-(surf|green)/i.test(item)).length
            ? value.photos.gallery.filter((item): item is string => typeof item === "string" && !/instagram-krui-(surf|green)/i.test(item))
            : DEFAULT_HOME_CONTENT.photos.gallery
          : DEFAULT_HOME_CONTENT.photos.gallery,
    },
  };
}

