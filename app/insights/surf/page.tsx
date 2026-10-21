import InsightsFrame from "@/app/components/InsightsFrame";

const surfPhotos = [
  { src: "/images/krui-coast-ride.jpg", alt: "Surfer riding a wave along the Krui coast", label: "A local day in Krui" },
  { src: "/images/krui-wave-rider.jpg", alt: "Surfer on a blue Krui wave", label: "The Indian Ocean" },
  { src: "/images/wave-rider-wide.jpg", alt: "Wide view of a surfer riding a wave", label: "Along the Pesisir Barat coast" },
  { src: "/images/air-surf-session.jpg", alt: "Surfer lifts off above a breaking wave", label: "Time above the water" },
  { src: "/images/barrel-session.jpg", alt: "Surfer inside a curling barrel wave", label: "In the pocket" },
  { src: "/images/krui-surf-turn.jpg", alt: "Surfer carving a turn on a Krui wave", label: "Find your line" },
];

export default function SurfInsights() {
  return <InsightsFrame eyebrow="KRUI · PESISIR BARAT · SURF" title="The coast, in its own rhythm." intro="A visual journal of surf sessions, ocean light, and the coastline around Krui. Surf stories live here, separate from Weskos Legal Co.’s business services.">
    <section className="insights-gallery surf-gallery" aria-label="Surf photography from Krui">
      {surfPhotos.map((item, index) => <figure className={`insights-gallery-item insights-gallery-item-${index + 1}`} key={item.src}><img src={item.src} alt={item.alt} loading="lazy"/><figcaption>{item.label}</figcaption></figure>)}
    </section>
  </InsightsFrame>;
}
