import type { LinkReturnType } from "../utils/parseHtmlAndExtractLinks.ts";

type ScrapeResponse = {
  meta: {
    url: string;
    totalLinks: number;
    totalInternalLinks: number;
    totalExternalLinks: number;
  };
  data: {
    links: LinkReturnType[];
  };
};

export const formatScrapeResponse = (
  url: string,
  links: LinkReturnType[]
): ScrapeResponse => {
  return {
    meta: {
      url,
      totalLinks: links.length,
      totalInternalLinks: links.filter((link) => link.type === "internal")
        .length,
      totalExternalLinks: links.filter((link) => link.type === "external")
        .length,
    },
    data: {
      links,
    },
  };
};
