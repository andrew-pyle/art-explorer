import type {
	MetCollectionObjectID,
	MetCollectionObjectResponse,
	MetCollectionSearchResponse,
} from "./MetMuseumCollectionTypes";
import { URLPathname } from "./URLPathname";
import metTags from "./MetTags.json";

// Types

interface SearchOptions extends CancellableOptions {
	minYear: number; // inclusive of this year
	maxYear: number; // inclusive of this year
}

interface CancellableOptions {
	signal?: AbortController["signal"];
}

// Component

export class MetMuseumCollection {
	origin: string;
	basePathname: string;
	// In-Memory Caches
	metCollectionObjectCache: Map<
		MetCollectionObjectID,
		MetCollectionObjectResponse
	> = new Map();

	constructor() {
		this.origin = "https://collectionapi.metmuseum.org";
		this.basePathname = "/public/collection/v1/";
	}

	/**
	 * @note Does not return all data. This returns a list of UNSETTLED
	 * promises, so the caller can show each promise result incrementally,
	 * as it settles, if needed.
	 *
	 * TODO use allSettled with Placeholder images
	 *
	 * @throws {AbortError} Accepts AbortController signal to abort the operation.
	 * @throws {HttpError} Indicates that the API did not return a usable result.
	 */
	explore = async (query: string, options: SearchOptions) => {
		try {
			const objectIDs = await this.#search(query, options);
			const objectsResponsePromises =
				objectIDs?.map((id) => ({
					id,
					artwork: this.#getArtwork(id, { signal: options.signal }),
				})) ?? [];
			return objectsResponsePromises;
		} catch (err) {
			if (
				(err instanceof DOMException && err.name === "AbortError") ||
				err instanceof AbortError
			) {
				const { signal, ...userOptions } = options;
				throw new AbortError(
					`Query: '${query}' with options: ${JSON.stringify({ userOptions })}`,
				);
			}

			if (err instanceof HttpError) {
				// Rethrow HttpError for consumer
				throw err;
			}

			// Unknown Error
			throw err;
		}
	};

	/**
	 * Search the MET Museum Collection via the public API.
	 * @throws {DOMException} Accepts AbortController signal to cancel HTTP
	 * requests. Throws on cancellation.
	 */
	#search = async (q: string, { minYear, maxYear, signal }: SearchOptions) => {
		// Short-circuit if signal already aborted.
		if (signal?.aborted) {
			throw new AbortError("Already Aborted before Search could start");
		}

		const searchParams = new URLSearchParams();

		// Use Met Museum Collection Tag search, if the user provided a query
		// which is a Tag (by accident)
		const queryIsMetTag = metTags.find((tag) =>
			new RegExp(`^${tag}$`, "i").test(q),
		);
		if (queryIsMetTag) {
			searchParams.set("tags", "true");
		}

		searchParams.set("hasImages", "true");
		searchParams.set("isHighlight", "true");
		searchParams.set("dateBegin", minYear.toString(10));
		searchParams.set("dateEnd", maxYear.toString(10));
		searchParams.set("q", q);

		const searchUrl = new URL(
			URLPathname.join(this.basePathname, "/search"),
			this.origin,
		);
		searchUrl.search = searchParams.toString();

		// console.log(searchUrl.toString()); // Debug: Show search query URLs as they happen
		const response = await fetch(searchUrl, { signal });

		if (!response.ok) {
			throw new HttpError(
				response.status,
				response.url,
				"I was searching the MET Museum Collection API.",
			);
		}

		const networkResults =
			(await response.json()) as MetCollectionSearchResponse;

		// We only need ID list
		return networkResults.objectIDs;
	};

	/**
	 * Retrieve an Artwork via its Met Museum Collection ID. Potentially
	 * returns result from an in-memory cache, falling back to network
	 * request from the MET Museum Collection public API.
	 *
	 * @throws {DOMException} Accepts AbortController signal to cancel HTTP
	 * requests. Throws on cancellation.
	 */
	#getArtwork = async (
		id: MetCollectionObjectID,
		{ signal }: CancellableOptions = {},
	): Promise<MetCollectionObjectResponse> => {
		// Short-circuit if signal already aborted.
		if (signal?.aborted) {
			throw new AbortError(
				"Already Aborted Before Artwork Retrieval could start",
			);
		}

		const cached = this._getObjectFromCache(id);
		if (cached) {
			return cached;
		}
		const networkResponse = await this.#getObjectFromNetwork(id, { signal });
		this._setObjectInCache(id, networkResponse);
		return networkResponse;
	};

	private _getObjectFromCache = (id: MetCollectionObjectID) => {
		return this.metCollectionObjectCache.get(id);
	};

	private _setObjectInCache(
		id: number,
		networkResponse: MetCollectionObjectResponse,
	) {
		this.metCollectionObjectCache.set(id, networkResponse);
	}

	/**
	 * Fetch an item from the Met Museum Collection via the public API.
	 * @throws {DOMException} Accepts AbortController signal to cancel HTTP
	 * requests. Throws on cancellation.
	 */
	#getObjectFromNetwork = async (
		id: MetCollectionObjectID,
		{ signal }: CancellableOptions = {},
	) => {
		const getUrl = new URL(
			URLPathname.join(this.basePathname, "/objects", id),
			this.origin,
		);

		const response = await fetch(getUrl, { signal });

		if (!response.ok) {
			throw new HttpError(
				response.status,
				response.url,
				`I was accessing the MET Museum Collection API for object ID=${id}`,
			);
		}

		return (await response.json()) as MetCollectionObjectResponse;
	};
}

// ---- Errors ---------------------
class HttpError extends Error {
	constructor(
		status: Response["status"],
		url: Response["url"],
		intention?: string,
	) {
		super();
		this.message = `HTTP Status ${status} from request to '${url}'.${
			intention ?? ""
		}`;
	}
}

export class AbortError extends Error {
	constructor(operation: string) {
		super();
		this.message = `Cancelled Operation: ${operation}`;
	}
}
