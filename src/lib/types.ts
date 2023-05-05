/**
 * HTML width and height are set by the layout, not the intrinsic
 * image size. It is necessary to set the size to avoid layout shift.
 */
export interface ArtResult {
	alt: string; // HTML img alt attribute value
	url: URL;
	objectID: number;
}

/**
 * HTML width and height are set by the layout, not the intrinsic
 * image size. It is necessary to set the size to avoid layout shift.
 */
export interface ArtworkT {
	id: string;
	title: string;
	year: number;
	alt: string;
	imgSrc: URL;
	additionalImgSrc?: URL[];
	link: string;
}

export type ArtworkSearchHandler = (
	query: string,
	options: { minYear: number; maxYear: number },
) => void;
