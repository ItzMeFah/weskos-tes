const phone = "6281511184631";
const email = "weskos.bventure@gmail.com";
const whatsapp = `https://wa.me/${phone}`;
const directions = "https://maps.app.goo.gl/4bhoLfCscugu52SW7?g_st=ipc";
const instagram = "https://instagram.com/weskos.legalservice";

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="site-footer-brand"><a className="footer-logo" href="/#home" aria-label="Weskos Legal Co. home"><img src="/images/weskos-logo.png" alt="Weskos Legal Co." /></a><p>Local business, property, and immigration guidance rooted in Krui.</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">Visit us in Pesisir Barat <span aria-hidden="true">↗</span></a></div>
      <div className="site-footer-column"><h2>Services</h2><a href="/services/company-formation">Company Formation &amp; PT PMA</a><a href="/services/business-permits">Business Licensing &amp; Permits</a><a href="/services/visa-immigration">Visa &amp; Immigration</a><a href="/services/property-due-diligence">Property Due Diligence</a><a href="/services/property-acquisition">Property Acquisition</a><a href="/services/legal-consulting">Legal Consulting</a></div>
      <div className="site-footer-column"><h2>Explore</h2><a href="/#about">About Weskos</a><a href="/insights/surf">Surf Journal</a><a href="/insights/product">Products</a><a href="/photo-credits">Photo Credits</a></div>
      <div className="site-footer-column site-footer-contact"><h2>Get in touch</h2><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp · +62 815-1118-4631</a><a href={`mailto:${email}`}>{email}</a><p>Jl. Jaya Wijaya Kp. Jawa,<br/>Pesisir Tengah, Pesisir Barat,<br/>Lampung 34874</p><a className="site-footer-directions" href={directions} target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div>
    </div>
    <div className="site-footer-bottom"><span>© 2026 Weskos Legal Co.</span><span>KRUI · PESISIR BARAT · INDONESIA</span><a href="/backoffice">ADMIN</a></div>
  </footer>;
}
