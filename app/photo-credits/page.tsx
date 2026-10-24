export const metadata = {
  title: "Photo Credits | Weskos Legal Co.",
  description: "Credits and source information for landscape photography used on Weskos Legal Co.",
};

const credits = [
  {
    image: "/images/krui-bukit-barisan.jpg",
    alt: "Bukit Barisan Selatan seen from Krui beach",
    title: "Bukit Barisan Selatan from Pantai Krui",
    author: "Hutanrimba366",
    source: "https://commons.wikimedia.org/wiki/File:Pesona_Bukit_Barisan_Selatan_dari_Hamparan_Pantai_Krui.jpg",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    licenseName: "CC BY-SA 4.0",
  },
  {
    image: "/images/pulau-pisang-coast.jpg",
    alt: "Beach and coastal landscape on Pulau Pisang, Lampung",
    title: "Pulau Pisang, Lampung",
    author: "Cendy00",
    source: "https://commons.wikimedia.org/wiki/File:Pulau_Pisang_Lampung.jpg",
    license: "https://creativecommons.org/licenses/by/4.0/",
    licenseName: "CC BY 4.0",
  },
  {
    image: "/images/pulau-pisang-beach.jpg",
    alt: "Sandy shore and turquoise water at Pulau Pisang",
    title: "Tepi Pantai Pulau Pisang",
    author: "Gayamentari",
    source: "https://commons.wikimedia.org/wiki/File:Tepi_Pantai_Pulau_Pisang.jpg",
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    licenseName: "CC0 1.0",
  },
  {
    image: "/images/pulau-pisang-view.jpg",
    alt: "Coastal view of Pulau Pisang, Krui, Pesisir Barat",
    title: "View from the right side of Pulau Pisang",
    author: "Kibe00",
    source: "https://commons.wikimedia.org/wiki/File:View_dari_Sebelah_Kanan_Pulau_Pisang.jpg",
    license: "https://creativecommons.org/licenses/by/4.0/",
    licenseName: "CC BY 4.0",
  },
  {
    image: "/images/hero-coast-aerial-01.webp",
    alt: "Aerial view of a tropical coastline and beach",
    title: "Krui coastline · aerial view",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-aerial-02.webp",
    alt: "Wide tropical coastline with blue water",
    title: "Krui coastline · blue water",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-boats-01.webp",
    alt: "Fishing boats along a palm lined beach",
    title: "Krui coast · fishing boats",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-bay-01.webp",
    alt: "Coastal bay with boats and distant hills",
    title: "Pesisir Barat · coastal bay",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-pier-01.webp",
    alt: "Aerial view of a coastal settlement and pier",
    title: "Pesisir Barat · coastal pier",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-boats-02.webp",
    alt: "Tropical beach and fishing boats from above",
    title: "Krui coast · beach and boats",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-clouds-01.webp",
    alt: "Cloudy coastal view over a village and bay",
    title: "Pesisir Barat · cloudy coastline",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-palms-01.webp",
    alt: "Palm lined beach with boats on the shore",
    title: "Krui coast · palm beach",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
  {
    image: "/images/hero-coast-village-01.webp",
    alt: "Village rooftops, green trees, and distant bay",
    title: "Pesisir Barat · village and bay",
    source: "https://drive.google.com/drive/folders/1-YrRZLieJU0kOVFc0eFufBYx3-U6JWhB",
  },
];

export default function PhotoCredits() {
  return (
    <main className="photo-credits-page">
      <a className="photo-credits-back" href="/">← Back to Weskos</a>
      <p className="eyebrow">WESKOS LEGAL CO. · KRUI, SUMATRA</p>
      <h1>Photo credits</h1>
      <p className="photo-credits-intro">Landscape photographs featured in the home page hero. The Krui images were supplied by Weskos; other images retain their original photographer and license credits.</p>
      <div className="photo-credits-list">
        {credits.map((credit) => (
          <article className="photo-credit" key={credit.image}>
            <img src={credit.image} alt={credit.alt} />
            <div>
              <h2>{credit.title}</h2>
              {credit.author && credit.source && <p>Photo by <a href={credit.source}>{credit.author}</a> · Wikimedia Commons</p>}
              {credit.license && credit.licenseName && <p>License: <a href={credit.license}>{credit.licenseName}</a></p>}
              {!credit.author && credit.source && <p>Photo provided by <a href={credit.source}>Weskos via shared Drive</a>. Optimized for web.</p>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
