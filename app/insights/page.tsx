import InsightsFrame from "@/app/components/InsightsFrame";

const destinations = [
  { title: "Product", eyebrow: "WESKOS SURF CO.", copy: "Surfboards, apparel, and the details behind the Weskos surf collection.", image: "/images/weskos-local-team.jpg", href: "/insights/product", alt: "Weskos surf community in Krui" },
  { title: "Surf", eyebrow: "KRUI · PESISIR BARAT", copy: "A visual journal of the coastline, waves, and surf community around Krui.", image: "/images/krui-coast-ride.jpg", href: "/insights/surf", alt: "Surfer riding a wave on the Pesisir Barat coast" },
];

export default function Insights() {
  return <InsightsFrame eyebrow="WESKOS · JOURNAL" title="Two sides of the coast." intro="Explore Weskos surf products and the places and people that shape surf life in Krui. This journal sits apart from our legal and business services.">
    <section className="insights-destinations" aria-label="Explore Insights">
      {destinations.map((item) => <a href={item.href} className="insights-destination" key={item.title}>
        <img src={item.image} alt={item.alt} loading="lazy" />
        <span className="insights-destination-copy"><small>{item.eyebrow}</small><b>{item.title}</b><span>{item.copy}</span><strong>Explore <i aria-hidden="true">↗</i></strong></span>
      </a>)}
    </section>
  </InsightsFrame>;
}
