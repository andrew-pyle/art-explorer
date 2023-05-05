import type {
	MetCollectionObjectID,
	MetCollectionObjectResponse,
	MetCollectionSearchResponse,
} from "./MetMuseumCollectionTypes";
import { URLPathname } from "./URLPathname";
import metTags from "./MetTags.json";

// Types

interface SearchOptions {
	minYear: number; // inclusive of this year
	maxYear: number; // inclusive of this year
}

// Front-end filters
//
// artworksPerYear?: number;
// artworksPerArtist?: number;
//
// const limitedArtworksPerArtist = this.#limitArtworksPerArtist(
// 	artworksPerYear,
// 	results.objectIDs,
// );
// const limitedArtworksPerYear = this.#limitArtworksPerArtist(
// 	artworksPerYear,
// 	results.objectIDs,
// );
//
// #limitArtworksPerArtist = (limit: number, idList: number[]) => {
// 	const idSet = idList.reduce(
// 		(acc: Set<number>, id: number) => (acc.size < limit ? acc.add(id) : acc),
// 		new Set(),
// 	);
// 	return Array.from(idSet.values());
// };
// #limitArtworksPerYear = (limit: number) => (acc: Set<number>, id: number) =>
// 	acc.size < limit ? acc.add(id) : acc;

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
	 */
	explore = async (query: string, options: SearchOptions) => {
		const objectIDs = await this.#search(query, options);
		const objectsResponsePromises =
			objectIDs?.map((id) => this.#getObject(id)) ?? [];
		return objectsResponsePromises;
	};

	#search = async (q: string, { minYear, maxYear }: SearchOptions) => {
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

		const networkResults = await this.#searchEndpoint(searchParams);
		return networkResults.objectIDs;
	};

	#searchEndpoint = async (searchParams: URLSearchParams) => {
		const searchUrl = new URL(
			URLPathname.join(this.basePathname, "/search"),
			this.origin,
		);
		searchUrl.search = searchParams.toString();

		// console.log(searchUrl.toString()); // Debug: Show search query URLs as they happen
		const response = await fetch(searchUrl);

		if (!response.ok) {
			throw new HttpError(
				response.status,
				response.url,
				"I was searching the MET Museum Collection API.",
			);
		}

		const networkResults =
			(await response.json()) as MetCollectionSearchResponse;

		return networkResults;
	};

	#getObject = async (
		id: MetCollectionObjectID,
	): Promise<MetCollectionObjectResponse> => {
		if (!this.metCollectionObjectCache.has(id)) {
			const networkResponse = await this.#getObjectEndpoint(id);
			this.metCollectionObjectCache.set(id, networkResponse);
		}
		return this.metCollectionObjectCache.get(id);
	};

	#getObjectEndpoint = async (id: MetCollectionObjectID) => {
		const getUrl = new URL(
			URLPathname.join(this.basePathname, "/objects", id),
			this.origin,
		);

		const response = await fetch(getUrl);

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
