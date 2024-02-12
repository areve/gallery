export async function cacheFlushKeys(keys: string[]) {
  const cache = await caches.open("cache");
  const allKeys = await cache.keys();
  const filteredKeys = allKeys.filter((x) => keys.indexOf(x.url.replace(/^http:\/\/gallery\.local/, "")) !== -1);
  const promises = filteredKeys.map((key) => cache.delete(key));
  await Promise.all(promises);
}

export async function cacheFlush() {
  const cache = await caches.open("cache");
  const keys = await cache.keys();
  const promises = keys.map((key) => cache.delete(key));
  await Promise.all(promises);
}

export async function cacheFetch(input: RequestInfo | URL, cacheKey: string): Promise<Response>;
export async function cacheFetch(input: RequestInfo | URL, init: RequestInit | undefined, cacheKey: string): Promise<Response>;
export async function cacheFetch(input: RequestInfo | URL, initOrCacheKey?: RequestInit | undefined | string, cacheKey?: string): Promise<Response> {
  let init;
  if (typeof initOrCacheKey === "string") {
    cacheKey = initOrCacheKey;
  } else {
    init = initOrCacheKey;
  }
  const cache = await caches.open("cache");
  const key = new Request(`http://gallery.local${cacheKey}`);
  let cacheResponse = await cache.match(key);
  if (!cacheResponse) {
    const response = await fetch(input, init);
    if (response.status >= 200 && response.status <= 299) {
      await cache.put(key, response);
    }
    cacheResponse = await cache.match(key);
  }

  return cacheResponse!;
}
