import InsightsFrame from "@/app/components/InsightsFrame";

const products = [
  { src: "/images/weskos-local-team.jpg", alt: "Weskos surf community in Krui", label: "Made around the surf community" },
  { src: "/images/surfboard-stencil-trio.png", alt: "Three monochrome Weskos surfboard artwork designs", label: "Board art & design" },
  { src: "/images/weskos-tshirt-art.jpg", alt: "Weskos surf apparel design", label: "Weskos apparel" },
];

export default function ProductInsights() {
  return <InsightsFrame eyebrow="WESKOS SURF CO. · PRODUCT" title="Made for time by the water." intro="A closer look at Weskos surf culture, board art, and apparel from Krui. For product availability, contact the Weskos team directly.">
    <section className="insights-gallery product-gallery" aria-label="Weskos surf products">
      {products.map((item, index) => <figure className={`insights-gallery-item insights-gallery-item-${index + 1}`} key={item.src}><img src={item.src} alt={item.alt} loading="lazy"/><figcaption>{item.label}</figcaption></figure>)}
    </section>
    <p className="insights-contact-note">Want to ask about an item? <a href="https://wa.me/6281511184631">Talk to Weskos ↗</a></p>
  </InsightsFrame>;
}
