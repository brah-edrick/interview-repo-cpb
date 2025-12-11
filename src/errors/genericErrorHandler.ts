import { Logger } from "../utils/logger.ts";
import { isHttpError, HttpStatusCodes } from "./httpError.ts";
import { isInternalError } from "./internalError.ts";

export const genericErrorHandler = (error: unknown, logger: Logger) => {
  // if the error is not an instance of Error, return a generic internal server error and something went very wrong
  if (!(error instanceof Error)) {
    logger.error("An error occurred but it is not an instance of Error"); // get this into our logging system but not the client
    return {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      message: "An error occurred",
    };
  }

  // Internal errors are errors that are not expected to be returned to the client
  if (isInternalError(error)) {
    logger.error(error.message); // get this into our logging system but not the client
    return {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      message: "An internal server error occurred",
    };
  }

  // Http errors are errors that are expected to be returned to the client
  if (isHttpError(error)) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  // this is a catch all for errors that are not HttpError or InternalError
  logger.error(error.message); // get this into our logging system but not the client
  return {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: "An error occurred",
  };
};
