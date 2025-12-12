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
};

export const parseHtmlAndExtractLinks = async ({
  html,
  excludeHeaderAndFooter,
}: tryParseHtmlAndExtractLinksParams) => {
  if (excludeHeaderAndFooter) {
    // remove header and footer from the html
    const $ = cheerio.load(html);
    $("header, footer").remove();
    html = $.html();
  }
  return new Promise<LinkReturnType[]>((resolve) => {
    const $ = cheerio.load(html);
    const linksMap = new Map<string, string>(); // use a map to avoid duplicates
    $("a").each((_, anchorElement) => {
      let href = $(anchorElement).attr("href");
      if (href) {
        // clean up some common cases
        if (href.startsWith("#")) {
          return; // skip hash links
        }
        if (href.startsWith("/")) {
          // if the href is a relative link, set the type to internal and store it as is
          linksMap.set(href, "internal");
          return;
        }

        const { url: urlObject, error } = tryParseUrl(href);
        if (error || !urlObject || !urlObject.hostname) {
          // if the href is not a valid url OR the hostname is not set, skip it
          // hostname may not be set for parseable urls that are protocol based like javascript:void(0) or mailto: or tel:
          return;
        }
        // strip hash and query params
        const urlToStore = `${urlObject.hostname}${urlObject.pathname}`;
        linksMap.set(urlToStore, "external");
        return;
      }
    });
    resolve(
      Array.from(linksMap.entries()).map(([url, type]) => ({
        url,
        type: type as LinkType,
      }))
    );
  });
};

export const tryParseHtmlAndExtractLinks = async ({
  html,
  excludeHeaderAndFooter,
}: tryParseHtmlAndExtractLinksParams): Promise<LinkReturnType[]> => {
  try {
    return await parseHtmlAndExtractLinks({ html, excludeHeaderAndFooter });
  } catch (error) {
    throw new InternalError(
      "An error occurred while parsing the HTML and extracting links"
    );
  }
};
