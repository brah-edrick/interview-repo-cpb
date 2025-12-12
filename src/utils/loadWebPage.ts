import {
  HttpError,
  HttpStatusCodes,
  isHttpError,
} from "../errors/httpError.ts";
import type { HttpStatusCode } from "../errors/httpError.ts";
import { InternalError } from "../errors/internalError.ts";

export const loadWebPage = async (url: string) => {
  try {
    // load the web page
    const response = await fetch(url);

    // check if the response is ok. If it isn't throw an error with the response status code
    if (!response.ok) {
      // forward the response status code to the client so it's clear if the page is not found or if there is another issue like authentication or authorization
      throw new HttpError(
        "Failed to load the web page",
        response.status as HttpStatusCode
      );
    }

    // check if the content type is text/html. If it isn't throw a 400 error
    if (!response.headers.get("content-type")?.includes("text/html")) {
      throw new HttpError(
        "The web page is not a text/html document",
        HttpStatusCodes.BAD_REQUEST
      );
    }

    // return the html of the web page
    return response.text();
  } catch (error) {
    if (error instanceof Error && isHttpError(error)) {
      throw error;
    }
    throw new InternalError("An error occurred while loading the web page");
  }
};
