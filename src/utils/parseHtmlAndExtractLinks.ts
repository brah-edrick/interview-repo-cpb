import * as cheerio from "cheerio";
import { tryParseUrl } from "./tryParseUrl.ts";
import { InternalError } from "../errors/internalError.ts";

type LinkType = "internal" | "external";

export type LinkReturnType = {
  url: string;
  type: LinkType;
};

type tryParseHtmlAndExtractLinksParams = {
  html: string;
  excludeHeaderAndFooter?: boolean;
  internalLinkBaseUrl: string;
};

export const parseHtmlAndExtractLinks = async ({
  html,
  excludeHeaderAndFooter,
  internalLinkBaseUrl,
}: tryParseHtmlAndExtractLinksParams) => {
  if (excludeHeaderAndFooter) {
    // remove header and footer from the html
    const $ = cheerio.load(html);
    $("header, footer").remove();
    html = $.html();
  }
  return new Promise<LinkReturnType[]>((resolve) => {
    const $ = cheerio.load(html);
    // use a map to avoid duplicates
    const linksMap = new Map<string, string>();
    $("a").each((_, anchorElement) => {
      let href = $(anchorElement).attr("href");

      const link = processLink(href, internalLinkBaseUrl);
      if (link) {
        storeLink(link.url, link.type, linksMap);
      }
      return;
    });

    // convert the map to an array of LinkReturnType
    resolve(
      Array.from(linksMap.entries()).map(([url, type]) => ({
        url,
        type: type as LinkType,
      }))
    );
  });
};

// wrapper function to handle errors

export const tryParseHtmlAndExtractLinks = async ({
  html,
  excludeHeaderAndFooter,
  internalLinkBaseUrl,
}: tryParseHtmlAndExtractLinksParams): Promise<LinkReturnType[]> => {
  try {
    return await parseHtmlAndExtractLinks({
      html,
      excludeHeaderAndFooter,
      internalLinkBaseUrl,
    });
  } catch (error) {
    throw new InternalError(
      "An error occurred while parsing the HTML and extracting links"
    );
  }
};

// local helper functions

const formatInternalLink = (href: string, internalLinkBaseUrl: string) => {
  const normalizedHref =
    href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  const urlToStore = `${internalLinkBaseUrl}${normalizedHref}`;
  return urlToStore;
};

const formatExternalLink = (href: string) => {
  const { url: urlObject, error } = tryParseUrl(href);
  if (!error && urlObject && urlObject.hostname) {
    return `${urlObject.hostname}${urlObject.pathname}`;
  }
  return null;
};

const processLink = (
  href: string | undefined,
  internalLinkBaseUrl: string
): LinkReturnType | undefined => {
  if (!href) {
    return undefined;
  }
  // format the internal link
  if (href.startsWith("/")) {
    return {
      url: formatInternalLink(href, internalLinkBaseUrl),
      type: "internal",
    };
  }
  // format the external link
  const externalLink = formatExternalLink(href);
  if (externalLink) {
    return { url: externalLink, type: "external" };
  }
  // there is no valid/storable url, so skip it
  return undefined;
};

const storeLink = (
  url: string,
  type: LinkType,
  linksMap: Map<string, string> // reference to the map
) => {
  linksMap.set(url, type);
};
