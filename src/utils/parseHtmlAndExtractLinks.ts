import * as cheerio from "cheerio";
import { tryParseUrl } from "./tryParseUrl.ts";

type LinkType = "internal" | "external";

type LinkReturnType = {
  url: string;
  type: LinkType;
};

export const parseHtmlAndExtractLinks = async (
  html: string,
  baseUrl: string
) => {
  return new Promise<LinkReturnType[]>((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const linksMap = new Map<string, string>(); // use a map to avoid duplicates
      $("a").each((_, anchorElement) => {
        let href = $(anchorElement).attr("href");
        let isInternalLink = false;
        if (href) {
          // clean up some common cases
          if (href.startsWith("#")) {
            return; // skip hash links
          }
          if (href.startsWith("/")) {
            console.log("href is a relative/internal link", href);
            href = `https://${baseUrl}${href}`; // prepend the base ur and https:// to the href to make it a full url
            isInternalLink = true;
          }
          const { url: urlObject, error } = tryParseUrl(href);
          if (error || !urlObject) {
            return;
          }
          const urlToStore = `${urlObject.hostname}${urlObject.pathname}`; // strip hash and query params
          linksMap.set(urlToStore, isInternalLink ? "internal" : "external");
          return;
        }
      });
      resolve(
        Array.from(linksMap.entries()).map(([url, type]) => ({
          url,
          type: type as LinkType,
        }))
      );
    } catch (error) {
      reject("An error occurred while parsing the HTML and extracting links");
    }
  });
};

export const tryParseHtmlAndExtractLinks = async (
  html: string,
  baseUrl: string
): Promise<{ links: LinkReturnType[]; error: Error | undefined }> => {
  try {
    return {
      links: await parseHtmlAndExtractLinks(html, baseUrl),
      error: undefined,
    };
  } catch (error) {
    return { links: [], error: error as Error };
  }
};
