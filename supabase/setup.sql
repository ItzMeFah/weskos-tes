-- Seed every editable homepage field in Supabase. Requires the existing public.site_content table.
-- Safe to run again: it only replaces an existing record when its content is still {}.
begin;

insert into public.site_content as current_home (id, content, updated_at)
values (
  'home',
  $$
  {
    "sectionOrder": ["intro", "services", "photoStory", "manifesto", "contact"],
    "heroTitle": "Make your next move.",
    "heroPhrases": [
      "Start your business with clarity.",
      "Know the land before you sign.",
      "Handle permits with local guidance.",
      "Plan your stay in Indonesia."
    ],
    "heroLead": "From company setup and permits to property and visa matters, get practical legal guidance rooted in Krui.",
    "heroVideo": "/images/krui-surf-intro.mp4",
    "heroVideoDurationSeconds": 4,
    "heroSlideIntervalSeconds": 10,
    "heroPhraseIntervalSeconds": 4,
    "heroImages": [
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
      "/images/krui-wave-rider.webp",
      "/images/wave-rider-wide.webp",
      "/images/barrel-session.webp",
      "/images/krui-surf-turn.webp",
      "/images/air-surf-session.webp"
    ],
    "photos": {
      "apparel": "/images/weskos-local-team.webp",
      "surfGoods": "/images/fishing-day.webp",
      "gallery": [
        "/images/krui-coast-ride.webp",
        "/images/krui-wave-rider.webp",
        "/images/wave-rider-wide.webp",
        "/images/air-surf-session.webp"
      ],
      "coastAndLocation": [],
      "boardArtwork": "/images/surfboard-stencil-trio.webp",
      "manifesto": "/images/krui-surf-turn.webp",
      "storefront": "/images/storefront.webp"
    },
    "introTitle": "Local insight for your next move in Indonesia.",
    "introBody": "Starting a company, sorting permits, exploring a property purchase, or extending your stay can bring a lot of questions. Weskos helps local and international clients understand the process and take the next step with confidence.",
    "services": [
      { "category": "BUSINESS SETUP", "title": "Company formation & PT PMA", "description": "Set up a local company or establish a PT PMA for foreign investment, with guidance through the required steps." },
      { "category": "LICENSING", "title": "Business permits", "description": "Help navigating business licenses, registrations, and ongoing legal administration in Indonesia." },
      { "category": "IMMIGRATION · WNA", "title": "Visa extensions", "description": "Assistance for foreign nationals who need help understanding or extending their Indonesian visa or stay permit." },
      { "category": "PROPERTY", "title": "Property due diligence", "description": "Review documents and key considerations before purchasing property, with guidance for local and foreign clients." },
      { "category": "PROPERTY", "title": "Property acquisition", "description": "Local support as you explore a property purchase and work through the applicable legal process." },
      { "category": "LEGAL SUPPORT", "title": "Legal solutions & disputes", "description": "Get help understanding business or property matters and the possible next steps for your situation." }
    ],
    "manifesto": {
      "eyebrow": "LOCAL KNOWLEDGE, PERSONAL GUIDANCE",
      "title": "Understand the process.\nMove forward with confidence.",
      "body": "Company setup, permits, property checks, or visa extensions can raise a lot of questions. Tell us what you are planning and our team will help you find a clear place to start.",
      "buttonText": "Talk to our team"
    },
    "contact": {
      "phone": "+62 815-1118-4631",
      "email": "weskos.bventure@gmail.com",
      "instagram": "@weskos.legalservice",
      "address": "Jl. Jaya Wijaya Kp. Jawa, Pesisir Tengah, Pesisir Barat, Lampung 34874",
      "eyebrow": "START WITH A CONVERSATION",
      "title": "Let's talk about\nyour plans in Krui.",
      "body": "Share what you are working toward. We can help you understand the next step.",
      "buttonText": "Message Weskos"
    },
    "copy": {
      "navHome": "Home", "navServices": "Services", "navAbout": "About", "navInsights": "Insights", "navContact": "Contact",
      "navProduct": "Product", "navSurf": "Surf", "navWhatsappLabel": "WhatsApp", "navInstagramLabel": "Instagram", "navEmailLabel": "Email",
      "homeAriaLabel": "Weskos Legal Co. home", "navAriaLabel": "Main navigation", "servicesMenuAriaLabel": "Weskos services", "insightsMenuAriaLabel": "Insights pages", "headerActionsAriaLabel": "Contact and appearance",
      "heroCta": "See how we can help", "heroLocation": "KRUI, PESISIR BARAT · INDONESIA",
      "introEyebrow": "WESKOS LEGAL CO.", "introTagLine1": "BUSINESS · VISA", "introTagLine2": "PERMITS · PROPERTY", "introLinkText": "Get to know Weskos",
      "servicesEyebrow": "FOR LOCAL & INTERNATIONAL CLIENTS", "servicesHeadingLine1": "Clear guidance.", "servicesHeadingLine2": "A confident next step.", "servicesLead": "From setting up a company to navigating property matters and permits, get practical support from a team that knows the area.", "serviceLinkText": "Explore this service",
      "photoStoryEyebrow": "LIFE ON THE COAST", "photoStoryTitleStart": "Our", "photoStoryTitleEm": "photo story", "photoStoryCaption": "KRUI · PESISIR BARAT", "photoStoryAltPrefix": "Weskos and Krui photo story",
      "manifestoImageAlt": "Krui coastline", "manifestoImageCaption": "PESISIR BARAT · SOUTH SUMATRA", "manifestoStamp": ["WESKOS", "KRUI", "INDONESIA"],
      "mapAriaLabel": "Open Weskos location in Google Maps", "mapPhotoAlt": "Weskos location in Pesisir Barat", "mapEyebrow": "GOOGLE MAPS · KRUI", "mapTitle": "Find Weskos in Pesisir Barat",
      "contactWhatsappLabel": "WhatsApp", "contactEmailLabel": "Email", "contactInstagramLabel": "Instagram",
      "footerBrandText": "Local business, property, and immigration guidance rooted in Krui.", "footerVisitLabel": "Visit us in Pesisir Barat", "footerServicesHeading": "Services", "footerExploreHeading": "Explore",
      "footerAboutLabel": "About Weskos", "footerSurfLabel": "Surf Journal", "footerProductsLabel": "Products", "footerPhotoCreditsLabel": "Photo Credits",
      "footerLegalHeading": "Legal", "footerTermsLabel": "Terms of Service", "footerPrivacyLabel": "Privacy Policy", "footerCookiesLabel": "Cookie Policy",
      "footerContactHeading": "Get in touch", "footerDirectionsLabel": "Get directions", "footerInstagramLabel": "Instagram",
      "footerCopyrightName": "Weskos Legal Co.", "footerLocation": "KRUI · PESISIR BARAT · INDONESIA", "footerAdminLabel": "ADMIN"
    }
  }
  $$::jsonb,
  now()
)
on conflict (id) do update
set content = excluded.content,
    updated_at = now()
where current_home.content = '{}'::jsonb;

commit;
