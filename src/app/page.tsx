import { App } from "../App";
import { DOWNLOADS, DUVIDAS, REPO, TELAS } from "../content";
import { AUTOR, DESCRICAO, SITE } from "../lib/site";

// Dados estruturados (JSON-LD) para os buscadores: o site, o autor, o app
// (gratis, para Windows, com versao, telas e download) e as duvidas.
const DADOS = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE}/#site`, url: SITE, name: "Claudinho", inLanguage: "pt-BR", publisher: { "@id": `${SITE}/#autor` } },
    { "@type": "Person", "@id": `${SITE}/#autor`, name: AUTOR.nome, url: AUTOR.url },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "Claudinho",
      url: SITE,
      description: DESCRICAO,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Interface de desktop para o Claude Code",
      operatingSystem: "Windows 10, Windows 11",
      softwareVersion: "1.0.1",
      softwareRequirements: "Claude Code instalado",
      inLanguage: "pt-BR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
      ...(DOWNLOADS.windows.url ? { downloadUrl: DOWNLOADS.windows.url, fileSize: "124 MB" } : {}),
      image: `${SITE}/opengraph-image.jpg`,
      screenshot: TELAS.map((t) => ({ "@type": "ImageObject", url: `${SITE}/assets/telas/${t.id}-1440.webp`, caption: t.alt })),
      author: { "@id": `${SITE}/#autor` },
      sameAs: [REPO],
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${SITE}/#codigo`,
      name: "Claudinho",
      codeRepository: REPO,
      programmingLanguage: "JavaScript",
      runtimePlatform: "Electron",
      license: "https://opensource.org/licenses/MIT",
      targetProduct: { "@id": `${SITE}/#app` },
      author: { "@id": `${SITE}/#autor` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#duvidas`,
      mainEntity: DUVIDAS.map((d) => ({ "@type": "Question", name: d.p, acceptedAnswer: { "@type": "Answer", text: d.r } })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS).replace(/</g, "\\u003c") }} />
      <App />
    </>
  );
}
