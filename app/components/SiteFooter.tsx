import { DEFAULT_HOME_CONTENT, type HomeContent } from "@/lib/home-content";

const directions = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";

export default function SiteFooter({ contact = DEFAULT_HOME_CONTENT.contact, services = DEFAULT_HOME_CONTENT.services, copy = DEFAULT_HOME_CONTENT.copy }: Partial<Pick<HomeContent, "contact" | "services" | "copy">> = {}) {
  const phone = contact.phone.replace(/\D/g, "");
  const instagram = `https://instagram.com/${contact.instagram.replace(/^@/, "")}`;
  const whatsapp = `https://wa.me/${phone}`;
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="site-footer-brand"><a className="footer-logo" href="/#home" aria-label={`${copy.footerCopyrightName} home`}><img src="/images/weskos-logo.webp" alt={copy.footerCopyrightName} /></a><p>{copy.footerBrandText}</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">{copy.footerVisitLabel} <span aria-hidden="true">↗</span></a></div>
      <div className="site-footer-column site-footer-services"><h2>{copy.footerServicesHeading}</h2>{services.map((service, index) => <a key={service.title} href={["/services/company-formation", "/services/business-permits", "/services/visa-immigration", "/services/property-due-diligence", "/services/property-acquisition", "/services/legal-consulting"][index]}>{service.title}</a>)}</div>
      <div className="site-footer-column"><h2>{copy.footerExploreHeading}</h2><a href="/#about">{copy.footerAboutLabel}</a><a href="/insights/surf">{copy.footerSurfLabel}</a><a href="/insights/product">{copy.footerProductsLabel}</a><a href="/photo-credits">{copy.footerPhotoCreditsLabel}</a></div>
      <nav className="site-footer-column site-footer-legal" aria-label={copy.footerLegalHeading}><h2>{copy.footerLegalHeading}</h2><a href="/terms-of-service">{copy.footerTermsLabel}</a><a href="/privacy-policy">{copy.footerPrivacyLabel}</a><a href="/cookie-policy">{copy.footerCookiesLabel}</a></nav>
      <div className="site-footer-column site-footer-contact"><h2>{copy.footerContactHeading}</h2><a href={whatsapp} target="_blank" rel="noreferrer">{copy.contactWhatsappLabel} · {contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><p>{contact.address}</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">{copy.footerDirectionsLabel} <span aria-hidden="true">↗</span></a><a href={instagram} target="_blank" rel="noreferrer">{copy.footerInstagramLabel} ↗</a></div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} {copy.footerCopyrightName}</span><span>{copy.footerLocation}</span><a href="/backoffice">{copy.footerAdminLabel}</a></div>
  </footer>;
}
