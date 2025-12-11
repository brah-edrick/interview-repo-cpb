import { HttpError, HttpStatusCodes } from "../errors/httpError.ts";
import { InternalError } from "../errors/internalError.ts";
import { tryParseUrl } from "../utils/tryParseUrl.ts";

export type ScrapeRequestBody = {
  url: string;
};
const ALLOWED_WEBSITES = process.env.ALLOWED_WEBSITES?.split(",") || [];

export const validateScrapeRequestBody = (body: object): ScrapeRequestBody => {
  // if the allowed websites list is not set, throw an internal error
  // our configuration was not set correctly
  if (!ALLOWED_WEBSITES.length) {
    throw new InternalError("Website allowed list is not set");
  }

  // if the url is not provided, throw an error
  const { url } = body as ScrapeRequestBody;
  if (!url) {
    throw new HttpError(
      "A URL is required but not provided",
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

  if (!ALLOWED_WEBSITES.includes(urlObject.hostname)) {
    throw new HttpError(
      `The URL hostname provided ${urlObject.hostname} is not allowed to be scraped`,
      HttpStatusCodes.BAD_REQUEST
    );
  }

  return { url };
};
