export const tryParseUrl = (
  url: string
): { url: URL | undefined; error: Error | undefined } => {
  try {
    return { url: new URL(url), error: undefined };
  } catch (error) {
    console.error("Error parsing URL", url, error);
    return { url: undefined, error: error as Error };
  }
};
