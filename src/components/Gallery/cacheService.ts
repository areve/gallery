// import { clone } from "@/lib/utils";

function cacheKey(...pathPaths: (string | undefined)[]) {
  const path = encodeURI(`/${pathPaths.join("/")}`.replace(/\/+/g, "/"));
  return "http://gallery.local" + path;
}

export async function cachePut(path: string | undefined, name: string, blob: Blob) {
  const cache = await caches.open("cache");
  await cache.put(cacheKey(path, name), new Response(blob));
}

export async function cacheGet(path: string | undefined, name: string) {
  const cache = await caches.open("cache");
  const cacheResponse = await cache.match(cacheKey(path, name));
  if (!cacheResponse) return;
  return await cacheResponse.blob();
}

export async function cacheDelete(path: string | undefined, name: string) {
  const cache = await caches.open("cache");
  cache.delete(cacheKey(path, name));
}
// export async function cacheFlushKeys(keys: string[]) {
//   const cache = await caches.open("cache");
//   const allKeys = await cache.keys();
//   const filteredKeys = allKeys.filter((x) => keys.indexOf(x.url.replace(/^http:\/\/gallery\.local/, "")) !== -1);
//   const promises = filteredKeys.map((key) => cache.delete(key));
//   await Promise.all(promises);
// }

// export async function cacheFlush() {
//   const cache = await caches.open("cache");
//   const keys = await cache.keys();
//   const promises = keys.map((key) => cache.delete(key));
//   await Promise.all(promises);
// }

// export async function cacheFetch(input: RequestInfo | URL, cacheKey: string): Promise<Response>;
// export async function cacheFetch(input: RequestInfo | URL, init: RequestInit | undefined, cacheKey: string): Promise<Response>;
// export async function cacheFetch(input: RequestInfo | URL, initOrCacheKey?: RequestInit | undefined | string, cacheKey?: string): Promise<Response> {
//   let init;
//   if (typeof initOrCacheKey === "string") {
//     cacheKey = initOrCacheKey;
//   } else {
//     init = initOrCacheKey;
//   }
//   const cache = await caches.open("cache");
//   const key = new Request(`http://gallery.local.local${cacheKey}`);
//   let cacheResponse = await cache.match(key);
//   if (!cacheResponse) {
//     const response = await fetch(input, init);
//     if (response.status >= 200 && response.status <= 299) {
//       await cache.put(key, response);
//     }
//     cacheResponse = await cache.match(key);
//   }

//   return cacheResponse!;
// }
