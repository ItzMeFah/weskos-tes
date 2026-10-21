export const metadata = {
  title: "Photo Credits | Weskos Legal Co.",
  description: "Credits and license information for landscape photography used on Weskos Legal Co.",
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
];

export default function PhotoCredits() {
  return (
    <main className="photo-credits-page">
      <a className="photo-credits-back" href="/">← Back to Weskos</a>
      <p className="eyebrow">WESKOS LEGAL CO. · KRUI, SUMATRA</p>
      <h1>Photo credits</h1>
      <p className="photo-credits-intro">Landscape photographs featured in the home page hero. Displayed with a CSS crop only; the image files are unmodified.</p>
      <div className="photo-credits-list">
        {credits.map((credit) => (
          <article className="photo-credit" key={credit.image}>
            <img src={credit.image} alt={credit.alt} />
            <div>
              <h2>{credit.title}</h2>
              <p>Photo by <a href={credit.source}>{credit.author}</a> · Wikimedia Commons</p>
              <p>License: <a href={credit.license}>{credit.licenseName}</a></p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
