import type { HomeContent } from "@/lib/home-content";

const directions = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";

export default function SiteFooter({ contact, services }: Pick<HomeContent, "contact" | "services">) {
  const phone = contact.phone.replace(/\D/g, "");
  const instagram = `https://instagram.com/${contact.instagram.replace(/^@/, "")}`;
  const whatsapp = `https://wa.me/${phone}`;
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="site-footer-brand"><a className="footer-logo" href="/#home" aria-label="Weskos Legal Co. home"><img src="/images/weskos-logo.webp" alt="Weskos Legal Co." /></a><p>Local business, property, and immigration guidance rooted in Krui.</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">Visit us in Pesisir Barat <span aria-hidden="true">↗</span></a></div>
      <div className="site-footer-column site-footer-services"><h2>Services</h2><a href="/services/company-formation">{services[0].title}</a><a href="/services/business-permits">{services[1].title}</a><a href="/services/visa-immigration">{services[2].title}</a><a href="/services/property-due-diligence">{services[3].title}</a><a href="/services/property-acquisition">{services[4].title}</a><a href="/services/legal-consulting">{services[5].title}</a></div>
      <div className="site-footer-column"><h2>Explore</h2><a href="/#about">About Weskos</a><a href="/insights/surf">Surf Journal</a><a href="/insights/product">Products</a><a href="/photo-credits">Photo Credits</a></div>
      <nav className="site-footer-column site-footer-legal" aria-label="Legal policies"><h2>Legal</h2><a href="/terms-of-service">Terms of Service</a><a href="/privacy-policy">Privacy Policy</a><a href="/cookie-policy">Cookie Policy</a></nav>
      <div className="site-footer-column site-footer-contact"><h2>Get in touch</h2><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp · {contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><p>{contact.address}</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div>
    </div>
    <div className="site-footer-bottom"><span>© 2026 Weskos Legal Co.</span><span>KRUI · PESISIR BARAT · INDONESIA</span><a href="/backoffice">ADMIN</a></div>
  </footer>;
}
