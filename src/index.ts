import "dotenv/config";
import fastify from "fastify";
import { loadWebPage } from "./utils/loadWebPage.ts";
import { validateScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import type { ScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import { genericErrorHandler } from "./errors/genericErrorHandler.ts";
import { Logger } from "./utils/logger.ts";
import { formatScrapeResponse } from "./responseFormatters/scrapeResponseFormatter.ts";
import { tryParseHtmlAndExtractLinks } from "./utils/parseHtmlAndExtractLinks.ts";

const server = fastify();

const serviceLogger = new Logger("scraper-service");

server.post<{ Body: ScrapeRequestBody }>("/scrape", async (request, reply) => {
  try {
    const { url, excludeHeaderAndFooter = false } = validateScrapeRequestBody(
      request.body
    );
    const html = await loadWebPage(url);
    const links = await tryParseHtmlAndExtractLinks({
      html,
      excludeHeaderAndFooter,
      internalLinkBaseUrl: new URL(url).origin, // use the origin (protocol + hostname) as the base url for storing internal links
    });
    const formattedResponse = formatScrapeResponse(
      url,
      excludeHeaderAndFooter,
      links
    );
    reply.send(formattedResponse);
  } catch (error) {
    const { statusCode, message } = genericErrorHandler(error, serviceLogger);
    reply.status(statusCode).send({ error: message });
  }
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    serviceLogger.error("An error occurred while starting the server");
    process.exit(1);
  }
  serviceLogger.log(`Server listening at ${address}`);
});
