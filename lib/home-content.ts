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
  heroTitle: "Ride the coast.",
  heroPhrases: ["Live the culture.", "Find your line in Krui.", "Chase the southern swell.", "Salt air, local spirit."],
  heroLead: "A home for boardriders on the edge of Sumatra. Shop surf essentials, find your people, and make the most of every day by the ocean.",
  heroVideo: "/images/krui-surf-intro.mp4",
  heroVideoDurationSeconds: 4,
  heroSlideIntervalSeconds: 10,
  heroImages: ["/images/krui-wave-rider.jpg", "/images/krui-surf-turn.jpg", "/images/air-surf-session.jpg", "/images/wave-rider-wide.jpg", "/images/barrel-session.jpg"],
  photos: {
    apparel: "/images/apparel-rack.jpeg",
    surfGoods: "/images/store-products.jpeg",
    gallery: ["/images/weskos-surf-tee.jpg", "/images/krui-coast-ride.jpg", "/images/weskos-tshirt-art.jpg", "/images/tropical-sumatera-shirt.jpg"],
    boardArtwork: "/images/surfboard-stencil-trio.png",
    manifesto: "/images/store-sign.jpeg",
    storefront: "/images/storefront.jpeg",
  },
  introTitle: "Made for life on the coast.",
  introBody: "Weskos is a local home for surf culture in Krui. From everyday gear to stories after a session, we stay close to the community and the waves we love.",
};

export function normalizeHomeContent(value: Partial<HomeContent> | null | undefined): HomeContent {
  const seconds = (candidate: unknown, fallback: number, min: number, max: number) => {
    const number = Number(candidate);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
  };
  return {
    ...DEFAULT_HOME_CONTENT,
    ...value,
    heroPhrases: Array.isArray(value?.heroPhrases) && value.heroPhrases.length ? value.heroPhrases : DEFAULT_HOME_CONTENT.heroPhrases,
    heroImages: Array.isArray(value?.heroImages) && value.heroImages.length ? value.heroImages : DEFAULT_HOME_CONTENT.heroImages,
    heroVideoDurationSeconds: seconds(value?.heroVideoDurationSeconds, DEFAULT_HOME_CONTENT.heroVideoDurationSeconds, 0, 30),
    heroSlideIntervalSeconds: seconds(value?.heroSlideIntervalSeconds, DEFAULT_HOME_CONTENT.heroSlideIntervalSeconds, 3, 120),
    photos: {
      ...DEFAULT_HOME_CONTENT.photos,
      ...value?.photos,
      gallery: Array.isArray(value?.photos?.gallery) ? value.photos.gallery.filter((item): item is string => typeof item === "string") : DEFAULT_HOME_CONTENT.photos.gallery,
    },
  };
}
