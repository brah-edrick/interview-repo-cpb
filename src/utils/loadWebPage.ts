export const loadWebPage = async (url: string) => {
  const response = await fetch(url)
  return response.text();
}