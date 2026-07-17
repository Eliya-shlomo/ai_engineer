const SEARCH_URL = "https://api.unsplash.com/search/photos";

async function searchOnePhoto(query, accessKey) {
  const url = `${SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const data = await res.json();
  const photo = data.results[0];
  if (!photo) {
    throw new Error(`No image found for query "${query}"`);
  }

  return {
    url: photo.urls.small,
    alt: photo.alt_description ?? "Outfit photo",
    credit: photo.user?.name ?? "Unknown",
    link: photo.links.html,
  };
}

export async function getOutfitImages(items) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not set");
  }

  return Promise.all(
    items.map(async ({ category, query }) => ({
      category,
      ...(await searchOnePhoto(query, accessKey)),
    }))
  );
}
