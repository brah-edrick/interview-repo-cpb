import type { LinkReturnType } from "../utils/parseHtmlAndExtractLinks.ts";

type ScrapeResponse = {
  meta: {
    url: string;
    excludeHeaderAndFooter: boolean;
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
  excludeHeaderAndFooter: boolean,
  links: LinkReturnType[]
): ScrapeResponse => {
  return {
    meta: {
      url,
      excludeHeaderAndFooter,
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
