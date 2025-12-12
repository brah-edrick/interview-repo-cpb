import { HttpError, HttpStatusCodes } from "../errors/httpError.ts";
import { InternalError } from "../errors/internalError.ts";
import { tryParseUrl } from "../utils/tryParseUrl.ts";

export type ScrapeRequestBody = {
  url: string;
  excludeHeaderAndFooter?: boolean;
};

// this is a list of websites that are allowed to be scraped
// configured in the .env file or on the deployment environment
const ALLOWED_WEBSITES = process.env.ALLOWED_WEBSITES?.split(",") || [];

export const validateScrapeRequestBody = (body: object): ScrapeRequestBody => {
  // if the allowed websites list is not set, throw an internal error
  // our configuration was not set correctly
  if (!ALLOWED_WEBSITES.length) {
    throw new InternalError("Website allowed list is not set");
  }

  const { url, excludeHeaderAndFooter } = body as ScrapeRequestBody;

  // if the url is not provided, throw an error
  if (!url) {
    throw new HttpError(
      "A URL is required but not provided",
      HttpStatusCodes.BAD_REQUEST
    );
  }

  // if the excludeHeaderAndFooter is provided, check if it is a boolean
  if (
    excludeHeaderAndFooter !== undefined &&
    typeof excludeHeaderAndFooter !== "boolean"
  ) {
    throw new HttpError(
      "Parameter excludeHeaderAndFooter must be a boolean",
      HttpStatusCodes.BAD_REQUEST
    );
  }

  // parse the url and check if it is allowed
  const { url: urlObject, error } = tryParseUrl(url);
  if (error || !urlObject) {
    throw new HttpError(
      "The URL provided is invalid or not parseable",
      HttpStatusCodes.BAD_REQUEST
    );
  }

  // check if the hostname is allowed to be scraped
  if (!ALLOWED_WEBSITES.includes(urlObject.hostname)) {
    throw new HttpError(
      `The URL hostname provided ${urlObject.hostname} is not allowed to be scraped`,
      HttpStatusCodes.FORBIDDEN
    );
  }

  return { url, excludeHeaderAndFooter };
};
