import "dotenv/config";
import fastify from "fastify";
import { loadWebPage } from "./utils/loadWebPage.ts";
import { validateScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import type { ScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import { genericErrorHandler } from "./errors/genericErrorHandler.ts";
import { Logger } from "./utils/logger.ts";
import { tryParseHtmlAndExtractLinks } from "./utils/parseHtmlAndExtractLinks.ts";
import { InternalError } from "./errors/internalError.ts";
import { formatScrapeResponse } from "./responseFormatters/scrapeResponseFormatter.ts";

const server = fastify();

const serviceLogger = new Logger("scraper-service");

server.post<{ Body: ScrapeRequestBody }>("/scrape", async (request, reply) => {
  try {
    const { url, excludeHeaderAndFooter } = validateScrapeRequestBody(
      request.body
    );
    const html = await loadWebPage(url);
    const links = await tryParseHtmlAndExtractLinks({
      html,
      excludeHeaderAndFooter,
    });
    const formattedResponse = formatScrapeResponse(url, links);
    reply.send(formattedResponse);
  } catch (error) {
    const { statusCode, message } = genericErrorHandler(error, serviceLogger);
    reply.status(statusCode).send({ error: message });
  }
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
