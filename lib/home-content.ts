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
  services: { title: string; description: string }[];
  manifesto: { eyebrow: string; title: string; body: string; buttonText: string };
  contact: {
    phone: string;
    email: string;
    instagram: string;
    address: string;
    eyebrow: string;
    title: string;
    body: string;
    buttonText: string;
  };
};

export const HOME_CONTENT_KEY = "home";

export const HERO_LANDSCAPE_IMAGES = [
  "/images/krui-bukit-barisan.webp",
  "/images/pulau-pisang-coast.webp",
  "/images/pesisir-green-fields.webp",
  "/images/pulau-pisang-view.webp",
  "/images/hero-coast-aerial-01.webp",
  "/images/hero-coast-aerial-02.webp",
  "/images/hero-coast-boats-01.webp",
  "/images/hero-coast-bay-01.webp",
  "/images/hero-coast-pier-01.webp",
  "/images/hero-coast-boats-02.webp",
  "/images/hero-coast-clouds-01.webp",
  "/images/hero-coast-palms-01.webp",
  "/images/hero-coast-village-01.webp",
];

export const HERO_SURF_IMAGES = [
  "/images/krui-wave-rider.webp",
  "/images/wave-rider-wide.webp",
  "/images/barrel-session.webp",
  "/images/krui-surf-turn.webp",
  "/images/air-surf-session.webp",
];

export const HERO_OPENING_IMAGE_COUNT = 4;

function useOptimizedLocalImage(src: string): string {
  return src.startsWith("/images/")
    ? src.replace(/\.(?:jpe?g|png)$/i, ".webp")
    : src;
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTitle: "Make your next move.",
  heroPhrases: ["Start your business with clarity.", "Know the land before you sign.", "Handle permits with local guidance.", "Plan your stay in Indonesia."],
  heroLead: "From company setup and permits to property and visa matters, get practical legal guidance rooted in Krui.",
  heroVideo: "/images/krui-surf-intro.mp4",
  heroVideoDurationSeconds: 4,
  heroSlideIntervalSeconds: 10,
  heroImages: [...HERO_LANDSCAPE_IMAGES, ...HERO_SURF_IMAGES],
  photos: {
    apparel: "/images/weskos-local-team.webp",
    surfGoods: "/images/fishing-day.webp",
    gallery: ["/images/krui-coast-ride.webp", "/images/krui-wave-rider.webp", "/images/wave-rider-wide.webp", "/images/air-surf-session.webp"],
    boardArtwork: "/images/surfboard-stencil-trio.webp",
    manifesto: "/images/krui-surf-turn.webp",
    storefront: "/images/storefront.webp",
  },
  introTitle: "Local insight for your next move in Indonesia.",
  introBody: "Starting a company, sorting permits, exploring a property purchase, or extending your stay can bring a lot of questions. Weskos helps local and international clients understand the process and take the next step with confidence.",
  services: [
    { title: "Company formation & PT PMA", description: "Set up a local company or establish a PT PMA for foreign investment, with guidance through the required steps." },
    { title: "Business permits", description: "Help navigating business licenses, registrations, and ongoing legal administration in Indonesia." },
    { title: "Visa extensions", description: "Assistance for foreign nationals who need help understanding or extending their Indonesian visa or stay permit." },
    { title: "Property due diligence", description: "Review documents and key considerations before purchasing property, with guidance for local and foreign clients." },
    { title: "Property acquisition", description: "Local support as you explore a property purchase and work through the applicable legal process." },
    { title: "Legal solutions & disputes", description: "Get help understanding business or property matters and the possible next steps for your situation." },
  ],
  manifesto: {
    eyebrow: "LOCAL KNOWLEDGE, PERSONAL GUIDANCE",
    title: "Understand the process.\nMove forward with confidence.",
    body: "Company setup, permits, property checks, or visa extensions can raise a lot of questions. Tell us what you are planning and our team will help you find a clear place to start.",
    buttonText: "Talk to our team",
  },
  contact: {
    phone: "+62 815-1118-4631",
    email: "weskos.bventure@gmail.com",
    instagram: "@weskos.legalservice",
    address: "Jl. Jaya Wijaya Kp. Jawa, Pesisir Tengah, Pesisir Barat, Lampung 34874",
    eyebrow: "START WITH A CONVERSATION",
    title: "Let's talk about\nyour plans in Krui.",
    body: "Share what you are working toward. We can help you understand the next step.",
    buttonText: "Message Weskos",
  },
};

export function normalizeHomeContent(value: Partial<HomeContent> | null | undefined): HomeContent {
  const seconds = (candidate: unknown, fallback: number, min: number, max: number) => {
    const number = Number(candidate);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
  };
  const configuredHeroImages = Array.isArray(value?.heroImages)
    ? value.heroImages.filter((photo): photo is string => typeof photo === "string" && !/instagram-krui-(surf|green)/i.test(photo)).map(useOptimizedLocalImage)
    : [];
  const surfImageSet = new Set(HERO_SURF_IMAGES);
  const configuredSurfImages = configuredHeroImages.filter((photo) => surfImageSet.has(photo));
  const surfImages = [...configuredSurfImages, ...HERO_SURF_IMAGES.filter((photo) => !configuredSurfImages.includes(photo))];
  const customImages = [...new Set(configuredHeroImages.filter((photo) => !HERO_LANDSCAPE_IMAGES.includes(photo) && !surfImageSet.has(photo)))];
  const heroImages = [...HERO_LANDSCAPE_IMAGES, ...customImages, ...surfImages];
  return {
    ...DEFAULT_HOME_CONTENT,
    ...value,
    // Move the original surf-first defaults forward while preserving any copy
    // the Weskos team has already customized in Supabase.
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
    heroImages: heroImages.length > HERO_LANDSCAPE_IMAGES.length ? heroImages : DEFAULT_HOME_CONTENT.heroImages,
    heroVideoDurationSeconds: seconds(value?.heroVideoDurationSeconds, DEFAULT_HOME_CONTENT.heroVideoDurationSeconds, 0, 30),
    heroSlideIntervalSeconds: seconds(value?.heroSlideIntervalSeconds, DEFAULT_HOME_CONTENT.heroSlideIntervalSeconds, 3, 120),
    photos: {
      ...DEFAULT_HOME_CONTENT.photos,
      ...value?.photos,
      apparel: ["/images/apparel-rack.webp", "/images/krui-coast-ride.webp", "/images/instagram-krui-green.webp"].includes(value?.photos?.apparel ?? "") ? DEFAULT_HOME_CONTENT.photos.apparel : useOptimizedLocalImage(value?.photos?.apparel ?? DEFAULT_HOME_CONTENT.photos.apparel),
      surfGoods: ["/images/store-products.webp", "/images/krui-wave-rider.webp", "/images/instagram-krui-surf.webp"].includes(value?.photos?.surfGoods ?? "") ? DEFAULT_HOME_CONTENT.photos.surfGoods : useOptimizedLocalImage(value?.photos?.surfGoods ?? DEFAULT_HOME_CONTENT.photos.surfGoods),
      manifesto: ["/images/store-sign.webp", "/images/krui-coast-ride.webp", "/images/instagram-krui-green.webp"].includes(value?.photos?.manifesto ?? "") ? DEFAULT_HOME_CONTENT.photos.manifesto : useOptimizedLocalImage(value?.photos?.manifesto ?? DEFAULT_HOME_CONTENT.photos.manifesto),
      gallery: Array.isArray(value?.photos?.gallery) && ![
        ["/images/weskos-surf-tee.webp", "/images/krui-coast-ride.webp", "/images/weskos-tshirt-art.webp", "/images/tropical-sumatera-shirt.webp"],
        ["/images/wave-rider-wide.webp", "/images/krui-surf-turn.webp", "/images/air-surf-session.webp", "/images/barrel-session.webp"],
      ].some((legacy) => value.photos!.gallery!.length === legacy.length && value.photos!.gallery!.every((photo, index) => photo === legacy[index]))
        ? DEFAULT_HOME_CONTENT.photos.gallery
        : Array.isArray(value?.photos?.gallery) && value.photos.gallery.length
          ? value.photos.gallery.filter((item): item is string => typeof item === "string" && !/instagram-krui-(surf|green)/i.test(item)).length
            ? value.photos.gallery.filter((item): item is string => typeof item === "string" && !/instagram-krui-(surf|green)/i.test(item)).map(useOptimizedLocalImage)
            : DEFAULT_HOME_CONTENT.photos.gallery
          : DEFAULT_HOME_CONTENT.photos.gallery,
      storefront: useOptimizedLocalImage(value?.photos?.storefront ?? DEFAULT_HOME_CONTENT.photos.storefront),
      boardArtwork: useOptimizedLocalImage(value?.photos?.boardArtwork ?? DEFAULT_HOME_CONTENT.photos.boardArtwork),
    },
    services: DEFAULT_HOME_CONTENT.services.map((service, index) => ({
      ...service,
      ...(Array.isArray(value?.services) ? value.services[index] : undefined),
    })),
    manifesto: { ...DEFAULT_HOME_CONTENT.manifesto, ...value?.manifesto },
    contact: { ...DEFAULT_HOME_CONTENT.contact, ...value?.contact },
  };
}

