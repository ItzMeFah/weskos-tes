import { notFound } from "next/navigation";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import ServiceScrollReveal from "@/app/components/ServiceScrollReveal";

const whatsappBase = "https://wa.me/6282210631017?text=";

const services = {
  "company-formation": {
    number: "01", eyebrow: "BUSINESS SETUP", nav: "Company Formation & PT PMA", title: "Set up your business with a clear plan.", intro: "Starting a company in Indonesia means making decisions about structure, registration, and the licenses your activity may require. Weskos helps local and international clients understand the steps and coordinate the process.", image: "/images/storefront.jpeg", alt: "Weskos storefront in Krui", sectionTitle: "Start with the right structure.", sectionCopy: "Whether you are setting up a local company or exploring a PT PMA, we help you get oriented and prepare for the decisions ahead.", help: ["Understand the company setup options for your plans", "Prepare information and documents for the registration process", "Coordinate with relevant professionals and authorities", "Identify follow-up registration and licensing considerations"], steps: ["Share your plan", "Review the requirements", "Move through the next steps"]
  },
  "business-permits": {
    number: "02", eyebrow: "LICENSING & ADMINISTRATION", nav: "Business Licensing & Permits", title: "Get a clearer view of business requirements.", intro: "Licenses and registrations depend on what a business does and where it operates. We help you identify the questions to resolve, organize the relevant details, and navigate the applicable administrative steps.", image: "/images/krui-bukit-barisan.jpg", alt: "The landscape around Krui, Pesisir Barat", sectionTitle: "Keep the paperwork moving.", sectionCopy: "Get practical guidance for understanding licensing requirements and handling business administration in Indonesia.", help: ["Review your business activity and registration questions", "Understand relevant licensing and OSS administration steps", "Organize supporting information and documents", "Discuss reporting or ongoing administration needs"], steps: ["Tell us about the business", "Map the relevant requirements", "Prepare and follow up"]
  },
  "visa-immigration": {
    number: "03", eyebrow: "IMMIGRATION · WNA", nav: "Visa & Immigration", title: "Plan your stay with better clarity.", intro: "Visa and stay-permit questions can depend on your circumstances and current requirements. Weskos assists foreign nationals with understanding the process and coordinating visa extension or related administrative support.", image: "/images/pulau-pisang-view.jpg", alt: "Coastline near Krui, South Sumatra", sectionTitle: "Understand your next immigration step.", sectionCopy: "We help you explain your situation, identify what information may be needed, and discuss the process with the team before moving forward.", help: ["Discuss your current visa or stay-permit situation", "Understand the information and documents to prepare", "Coordinate assistance with extension-related administration", "Ask about related immigration questions and next steps"], steps: ["Share your current situation", "Review what may be required", "Coordinate the next steps"]
  },
  "property-due-diligence": {
    number: "04", eyebrow: "PROPERTY", nav: "Property Due Diligence", title: "Look into the details before you commit.", intro: "Property decisions deserve careful review. Weskos can help local and foreign clients organize questions around documents, ownership, land-use considerations, and the process involved before moving ahead.", image: "/images/pulau-pisang-coast.jpg", alt: "Aerial view of a coastal area in Pesisir Barat", sectionTitle: "Make room for informed questions.", sectionCopy: "Get local guidance as you review the information available and decide what further checks or professional advice may be needed.", help: ["Organize the documents and questions you already have", "Discuss ownership and transaction considerations", "Identify items that may need further verification", "Understand possible next steps before signing"], steps: ["Describe the property", "Review available information", "Clarify open questions"]
  },
  "property-acquisition": {
    number: "05", eyebrow: "PROPERTY", nav: "Property Acquisition", title: "Navigate a property purchase thoughtfully.", intro: "Buying property in Indonesia can involve several legal and administrative considerations. Weskos helps you get oriented, understand the stages involved, and connect the details of your plans with the questions that need answers.", image: "/images/krui-coast-ride.jpg", alt: "Coastal landscape in Pesisir Barat", sectionTitle: "A local partner for the process.", sectionCopy: "Get practical support as you explore a purchase and work through the relevant legal process for your situation.", help: ["Discuss your goals and the type of property you are considering", "Understand key legal and administrative questions", "Coordinate document review and due-diligence discussions", "Plan the next steps with relevant professionals"], steps: ["Tell us what you are considering", "Identify key checks and requirements", "Coordinate a way forward"]
  },
  "legal-consulting": {
    number: "06", eyebrow: "LEGAL SUPPORT", nav: "Legal Consulting & Disputes", title: "Get grounded before deciding what comes next.", intro: "When a business or property issue feels unclear, a focused conversation can help organize the facts and possible next steps. Weskos supports clients with local context and practical coordination.", image: "/images/weskos-local-team.jpg", alt: "Weskos team and surf community in Krui", sectionTitle: "Bring your questions to the table.", sectionCopy: "Tell us what is happening. We can help you understand the issue, discuss available options, and identify whether another specialist should be involved.", help: ["Discuss business or property concerns", "Organize the background and relevant documents", "Understand possible routes for resolving a dispute", "Coordinate follow-up with the appropriate professionals"], steps: ["Explain the situation", "Review the relevant details", "Discuss possible next steps"]
  },
} as const;

type ServiceSlug = keyof typeof services;

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  return { title: service ? `${service.nav} | Weskos Legal Co.` : "Weskos Legal Co." };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();
  const message = encodeURIComponent(`Hello Weskos Legal Co., I would like to ask about ${service.nav.toLowerCase()}.`);

  return <main className="service-detail-page">
    <SiteHeader />
    <ServiceScrollReveal />
    <div className="service-breadcrumb" data-service-reveal="text"><a href="/">Home</a><span>/</span><a href="/#services">Services</a><span>/</span><span>{service.nav}</span></div>
    <section className="service-detail-hero">
      <div className="service-detail-heading" data-service-reveal="text"><p className="eyebrow">{service.eyebrow} · WESKOS LEGAL CO.</p><span className="service-detail-number">{service.number} / 06</span><h1>{service.title}</h1><p>{service.intro}</p><a className="button button-dark" href={`${whatsappBase}${message}`}>Discuss this service <span aria-hidden="true">↗</span></a></div>
      <div className="service-detail-image" data-service-reveal="image"><img src={service.image} alt={service.alt}/><span>LOCAL KNOWLEDGE · KRUI, SUMATRA</span></div>
    </section>
    <section className="service-detail-overview" id="service-overview"><div data-service-reveal="text"><p className="eyebrow">HOW WE CAN HELP</p><h2>{service.sectionTitle}</h2></div><div className="service-detail-overview-copy" data-service-reveal="text"><p>{service.sectionCopy}</p><ul>{service.help.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
    <section className="service-detail-steps"><p className="eyebrow" data-service-reveal="text">A CLEAR PLACE TO START</p><h2 data-service-reveal="text">We’ll take it one step at a time.</h2><div className="service-step-grid">{service.steps.map((item, index) => <article key={item} data-service-reveal="item"><span>0{index + 1}</span><h3>{item}</h3></article>)}</div></section>
    <section className="service-detail-cta"><p className="eyebrow" data-service-reveal="text">HAVE A QUESTION?</p><h2 data-service-reveal="text">Tell us what you’re working on.</h2><a className="button button-dark" data-service-reveal="text" href={`${whatsappBase}${message}`}>Talk to the Weskos team <span aria-hidden="true">↗</span></a></section>
    <nav className="service-detail-related" aria-label="Other Weskos services"><span data-service-reveal="text">EXPLORE OTHER SERVICES</span>{Object.entries(services).filter(([key]) => key !== slug).map(([key, item]) => <a href={`/services/${key}`} key={key} data-service-reveal="item">{item.nav} <span aria-hidden="true">↗</span></a>)}</nav>
    <SiteFooter />
  </main>;
}
