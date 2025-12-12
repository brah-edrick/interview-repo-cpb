# Coding Challenge

Use preferred language of choice.

## Part 1

Write a script that screenscrapes https://www.cpb.bank/ and pulls out all of the unique internal and external links. Function should return a JSON object that includes an array of the URLs (or an array of objects with URL details). Ensure duplicates are being removed, taking into consideration composition of URL components including path and GET parameters.

### Extra

Add in additional optional logic to not include any links from the header and the footer on the site.

## Part 2

Expose the screenscraping logic behind a single RESTful API route where a POST request is made that includes the URL that should be searched for all of the URLs. For example, if someone provides the URL `https://www.cpb.bank/personal-banking/checking-accounts/shaka-checking`, it should return the URLs that are in the body of the content.

### Error Handling

If someone provides a URL that is not a CPB URL, gracefully error out with a 4XX error status code and detailed message highlighting the error.

# API Usage

### `.env` setup

Be sure to include the hosts you want to allow scraping of by setting `ALLOWED_WEBSITES`

```bash
ALLOWED_WEBSITES=www.cpb.bank
```

### Basic Scrape

Scrape a URL and extract all links (including header and footer):

```bash
curl -X POST http://localhost:8080/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.cpb.bank/"}'
```

### Scrape Excluding Header and Footer

Scrape a URL and exclude links from the header and footer:

```bash
curl -X POST http://localhost:8080/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.cpb.bank/", "excludeHeaderAndFooter": true}'
```

### Scrape a page that doesn't exist

Expect this to 404

```bash
curl -X POST http://localhost:8080/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.cpb.bank/fooooooo"}'
```

### Scrape an non-allowed site

Scrape a URL for a site that isn't in the allow list by host

```bash
curl -X POST http://localhost:8080/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com/"}'
```
