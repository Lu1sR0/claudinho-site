import type { MetadataRoute } from "next";

import { SITE } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE}/opengraph-image.jpg`, `${SITE}/assets/telas/conversa-1440.webp`, `${SITE}/assets/telas/inicio-1440.webp`, `${SITE}/assets/telas/biblioteca-1440.webp`, `${SITE}/assets/telas/personalizar-1440.webp`],
    },
  ];
}
