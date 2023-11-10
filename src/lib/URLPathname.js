// @ts-check

/** @typedef {string | number | URLPathname} PathPart */

// Class

export class URLPathname {
	/**
	 * @param {PathPart[]} pathParts
	 */
	constructor(...pathParts) {
		/** @type {string} */
		this.pathname = this.join(...pathParts);
	}

	/**
	 * Joins URL path segments. Leftmost argument is first, joining in order
	 * to rightmost argument last. Maintains presence or absence of final
	 * slash in final argument.
	 * @see https://github.com/nodejs/node/issues/18288#issuecomment-475864601
	 *
	 * @param {PathPart[]} pathParts All parts of the path to join into a single pathname
	 */
	join(...pathParts) {
		// Accumulator
		const elements = [];

		// Create list of path parts, as strings, with no slashes (preserving the final trailing slash)
		for (const [index, part] of pathParts.entries()) {
			// Determine which iteration is the final one
			const isFinalPart = index + 1 === pathParts.length;

			// Reject invalid Parts, so the caller knows something isn't right
			if (part === undefined || part === null) {
				throw new Error(`Invalid URL part provided: '${part}'`);
			}

			// Allow numbers or other instances of the class as arguments
			const stringPart = String(part);

			// Remove leading and trailing slashes from each path part, if there is a slash.
			// Preserve the trailing slash of the final part
			const pathPart = this._stripSlashes(stringPart, {
				preserveTrailing: isFinalPart,
			});

			// Add to accumulator
			elements.push(pathPart);
		}

		// Provide a leading '/', and put exactly one '/' between each part
		// Trailing slash of the last element (if present) is preserved within
		// loop above
		return `/${elements.join("/")}`;
	}

	/**
	 * Append path parts to the existing URLPathname
	 * @param {PathPart[]} pathParts All parts of the path to join into a single pathname
	 */
	append(...pathParts) {
		return this.join(this, ...pathParts);
	}

	/**
	 * Remove leading and trailing slashes preserving, optionally preserving
	 * the final slash on the final argument.
	 * @param {string} part
	 */
	_stripSlashes(part, { preserveTrailing = false } = {}) {
		if (preserveTrailing) {
			return part.replace(/(^\/)/g, "");
		}
		return part.replace(/(^\/|\/$)/g, "");
	}

	/**
	 * Support contexts which call toString() implicitly, like URL() constructor
	 * template literals, and String() constructor.
	 */
	toString() {
		return this.pathname;
	}
}