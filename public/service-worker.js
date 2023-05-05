const serviceWorkerVersion = "0.1.0";
const metArtFilesCacheName = `met-image-files-${serviceWorkerVersion}`;

/**
 * Stale-While-Revalidate for Images, network for everything else.
 * @link https://web.dev/offline-cookbook/#stale-while-revalidate
 */
self.addEventListener("fetch", (event) => {
	const request = new URL(event.request.url);
	switch (request.hostname) {
		case "images.metmuseum.org": {
			event.respondWith(staleWhileRevalidate(event));
			break;
		}

		default: {
			// Don't call event.respondWith, so we get default network behavior
			break;
		}
	}
});

async function staleWhileRevalidate(event) {
	const cache = await caches.open(metArtFilesCacheName);
	const response = await cache.match(event.request);
	const fetchPromise = fetch(event.request).then((networkResponse) => {
		cache.put(event.request, networkResponse.clone());
		return networkResponse;
	});
	//  Respond with cache hit promise or network promise, if there is none
	return response ?? fetchPromise;
}
