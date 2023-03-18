import { clone } from "@/lib/utils";

export async function cacheFlush() {
  const cache = await caches.open("cache");
  const keys = await cache.keys();
  const all = keys.map((key) => cache.delete(key));
  await Promise.all(all);
}

export async function cacheFetch(input: RequestInfo | URL, init?: RequestInit | undefined, flush?: boolean): Promise<Response> {
  const cache = await caches.open("cache");
  const cloneInit = clone(init);
  delete cloneInit?.headers;
  const key = new Request(input, cloneInit);

  if (flush) await cache.delete(key);

  let cacheResponse = await cache.match(key);
  if (!cacheResponse) {
    // console.log("cache miss");
    const response = await fetch(input, init);
    await cache.put(key, response);
    cacheResponse = await cache.match(key);
  } else {
    // console.log("cache hit");
  }

  return cacheResponse!;
}
