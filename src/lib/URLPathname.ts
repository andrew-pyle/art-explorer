// Types

type PathPart = string | number | URLPathname;

// Class

export class URLPathname {
	pathname: string;

	constructor(...pathParts: PathPart[]) {
		this.pathname = URLPathname.join(...pathParts);
	}

	static join = (...pathParts: PathPart[]) => {
		const partsArr = pathParts
			.map((part) => part.toString())
			.map(this.stripSlashesExceptLastOne);
		return `/${pathParts
			.map((part) => part.toString())
			.map(this.stripSlashesExceptLastOne)
			.map(encodeURI)
			.join("/")}`;
	};

	static stripSlashesExceptLastOne = (
		part: string,
		index: number,
		partList: string[],
	) => {
		const isFinalPart = index + 1 === partList.length;
		if (isFinalPart) {
			return part.replace(/(^\/)/g, ""); // remove only initial slash
		}
		return part.replace(/(^\/|\/$)/g, ""); // remove both initial and trailing slashes
	};

	toString = () => {
		return this.pathname;
	};
}
