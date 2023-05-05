import { MetCollectionObjectResponse } from "./MetMuseumCollectionTypes";
import { ArtworkT } from "./types";
/**
 * Parse a response from the Met Collection API into App type
 * @throws if any URL is not valid
 */
export function parseArtwork(
	metCollectionObject: MetCollectionObjectResponse,
): ArtworkT {
	return {
		id: metCollectionObject.objectID.toString(10),
		title: metCollectionObject.title,
		alt: `Artwork "${metCollectionObject.title}" by ${metCollectionObject.artistDisplayName}`,
		imgSrc: new URL(metCollectionObject.primaryImageSmall),
		additionalImgSrc: metCollectionObject.additionalImages.map(
			(str) => new URL(str),
		),
		year: metCollectionObject.objectEndDate,
		link: metCollectionObject.objectURL,
	};
}
