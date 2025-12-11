import "dotenv/config";
import fastify from "fastify";
import { loadWebPage } from "./utils/loadWebPage.ts";
import { validateScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import type { ScrapeRequestBody } from "./validators/scrapeRequestBody.ts";
import { genericErrorHandler } from "./errors/genericErrorHandler.ts";
import { Logger } from "./utils/logger.ts";
import { tryParseHtmlAndExtractLinks } from "./utils/parseHtmlAndExtractLinks.ts";
import { InternalError } from "./errors/internalError.ts";

const server = fastify();

const serviceLogger = new Logger("scraper-service");

server.post<{ Body: ScrapeRequestBody }>("/scrape", async (request, reply) => {
  try {
    const { url } = validateScrapeRequestBody(request.body);
    const html = await loadWebPage(url);
    const baseUrl = new URL(url).host;
    const { links, error } = await tryParseHtmlAndExtractLinks(html, baseUrl);
    if (error) {
      throw new InternalError(
        "An error occurred while parsing the HTML and extracting links"
      );
    }
    reply.send({
      meta: {
        url,
        totalLinks: links.length,
        totalInternalLinks: links.filter((link) => link.type === "internal")
          .length,
        totalExternalLinks: links.filter((link) => link.type === "external")
          .length,
      },
      data: {
        links,
      },
    });
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
