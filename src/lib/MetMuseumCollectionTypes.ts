// ---- API Responses ---------------------

/**
 * GET /search
 */
export interface MetCollectionSearchResponse {
	total: number;
	objectIDs: null | MetCollectionObjectID[]; // null if total is zero
}

/**
 * GET /objects/{id}
 */
export interface MetCollectionObjectResponse {
	objectID: number; //	Identifying number for each artwork (unique, can be used as key field)	437133
	isHighlight: boolean; //	When "true" indicates a popular and important artwork in the collection	Vincent van Gogh's "Wheat Field with Cypresses"
	accessionNumber: string; //	Identifying number for each artwork (not always unique)	"67.241"
	accessionYear: string; //	Year the artwork was acquired.	"1921"
	isPublicDomain: boolean; //	When "true" indicates an artwork in the Public Domain	Vincent van Gogh's "Wheat Field with Cypresses"
	primaryImage: string; //	URL to the primary image of an object in JPEG format	"https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg"
	primaryImageSmall: string; //	URL to the lower-res primary image of an object in JPEG format	"https://images.metmuseum.org/CRDImages/ep/web-large/DT1567.jpg"
	additionalImages: string[]; //	An array containing URLs to the additional images of an object in JPEG format	["https://images.metmuseum.org/CRDImages/ep/original/LC-EP_1993_132_suppl_CH-004.jpg", "https://images.metmuseum.org/CRDImages/ep/original/LC-EP_1993_132_suppl_CH-003.jpg", "https://images.metmuseum.org/CRDImages/ep/original/LC-EP_1993_132_suppl_CH-002.jpg", "https://images.metmuseum.org/CRDImages/ep/original/LC-EP_1993_132_suppl_CH-001.jpg"]
	constituents: MetCollectionConstituent[]; //	An array containing the constituents associated with an object, with the constituent's role, name, ULAN URL, Wikidata URL, and gender, when available (currently contains female designations only).	[{"constituentID": 161708,"role": "Artist","name": "Louise Bourgeois","constituentULAN_URL": "http://vocab.getty.edu/page/ulan/500057350","constituentWikidata_URL": "https://www.wikidata.org/wiki/Q159409","gender": "Female"}]
	department: string; //	Indicates The Met's curatorial department responsible for the artwork	"Egyptian Art"
	objectName: string; //	Describes the physical type of the object	"Dress", "Painting", "Photograph", or "Vase"
	title: string; //	Title, identifying phrase, or name given to a work of art	"Wheat Field with Cypresses"
	culture: string; //	Information about the culture, or people from which an object was created	"Afghan", "British", "North African"
	period: string; //	Time or time period when an object was created	"Ming dynasty (1368-1644)", "Middle Bronze Age"
	dynasty: string; //	Dynasty (a succession of rulers of the same line or family) under which an object was created	"Kingdom of Benin", "Dynasty 12"
	reign: string; //	Reign of a monarch or ruler under which an object was created	"Amenhotep III", "Darius I", "Louis XVI"
	portfolio: string; //	A set of works created as a group or published as a series.	"Birds of America", "The Hudson River Portfolio", "Speculum Romanae Magnificentiae"
	artistRole: string; //	Role of the artist related to the type of artwork or object that was created	"Artist for Painting", "Designer for Dress"
	artistPrefix: string; //	Describes the extent of creation or describes an attribution qualifier to the information given in the artistRole field	"In the Style of", "Possibly by", "Written in French by"
	artistDisplayName: string; //	Artist name in the correct order for display	"Vincent van Gogh"
	artistDisplayBio: string; //	Nationality and life dates of an artist, also includes birth and death city when known.	"Dutch, Zundert 1853–1890 Auvers-sur-Oise"
	artistSuffix: string; //	Used to record complex information that qualifies the role of a constituent, e.g. extent of participation by the Constituent (verso only, and followers)	"verso only"
	artistAlphaSort: string; //	Used to sort artist names alphabetically. Last Name, First Name, Middle Name, Suffix, and Honorific fields, in that order.	"Gogh, Vincent van"
	artistNationality: string; //	National, geopolitical, cultural, or ethnic origins or affiliation of the creator or institution that made the artwork	"Spanish"; "Dutch"; "French, born Romania"
	artistBeginDate: string; //	Year the artist was born	"1840"
	artistEndDate: string; //	Year the artist died	"1926"
	artistGender: string; //	Gender of the artist (currently contains female designations only)	"female"
	artistWikidata_URL: string; //	Wikidata URL for the artist	"https://www.wikidata.org/wiki/Q694774"
	artistULAN_URL: string; //	ULAN URL for the artist	"https://vocab.getty.edu/page/ulan/500003169"
	objectDate: string; //	Year, a span of years, or a phrase that describes the specific or approximate date when an artwork was designed or created	"1865–67", "19th century", "ca. 1796"
	objectBeginDate: number; //	Machine readable date indicating the year the artwork was started to be created	1867, 1100, -900
	objectEndDate: number; //	Machine readable date indicating the year the artwork was completed (may be the same year or different year than the objectBeginDate)	1888, 1100, -850
	medium: string; //	Refers to the materials that were used to create the artwork	"Oil on canvas", "Watercolor", "Gold"
	dimensions: string; //	Size of the artwork or object	"16 x 20 in. (40.6 x 50.8 cm)"
	dimensionsParsed: number; //	Size of the artwork or object in centimeters, parsed	[{"element":"Sheet","dimensionType":"Height","dimension":51},{"element":"Plate","dimensionType":"Height","dimension":47.5},{"element":"Sheet","dimensionType":"Width","dimension":72.8},{"element":"Plate","dimensionType":"Width","dimension":62.5}]
	measurements: MetCollectionMeasurement[]; //	Array of elements, each with a name, description, and set of measurements. Spatial measurements are in centimeters; weights are in kg.	[ { "elementName": "Overall", "elementDescription": "Temple proper", "elementMeasurements": { "Height": 640.0813, "Length": 1249.6825, "Width": 640.0813 } } ]
	creditLine: string; //	Text acknowledging the source or origin of the artwork and the year the object was acquired by the museum.	"Robert Lehman Collection, 1975"
	geographyType: string; //	Qualifying information that describes the relationship of the place catalogued in the geography fields to the object that is being catalogued	"Made in", "From", "Attributed to"
	city: string; //	City where the artwork was created	"New York", "Paris", "Tokyo"
	state: string; //	State or province where the artwork was created, may sometimes overlap with County	"Alamance", "Derbyshire", "Brooklyn"
	county: string; //	County where the artwork was created, may sometimes overlap with State	"Orange County", "Staffordshire", "Brooklyn"
	country: string; //	Country where the artwork was created or found	"China", "France", "India"
	region: string; //	Geographic location more specific than country, but more specific than subregion, where the artwork was created or found (frequently null)	"Bohemia", "Midwest", "Southern"
	subregion: string; //	Geographic location more specific than Region, but less specific than Locale, where the artwork was created or found (frequently null)	"Malqata", "Deir el-Bahri", "Valley of the Kings"
	locale: string; //	Geographic location more specific than subregion, but more specific than locus, where the artwork was found (frequently null)	"Tomb of Perneb", "Temple of Hatshepsut", "Palace of Ramesses II"
	locus: string; //	Geographic location that is less specific than locale, but more specific than excavation, where the artwork was found (frequently null)	"1st chamber W. wall"; "Burial C 2, In coffin"; "Pit 477"
	excavation: string; //	The name of an excavation. The excavation field usually includes dates of excavation.	"MMA excavations, 1923–24"; "Khashaba excavations, 1910–11"; "Carnarvon excavations, 1912"
	river: string; //	River is a natural watercourse, usually freshwater, flowing toward an ocean, a lake, a sea or another river related to the origins of an artwork (frequently null)	"Mississippi River", "Nile River", "River Thames"
	classification: string; //	General term describing the artwork type.	"Basketry", "Ceramics", "Paintings"
	rightsAndReproduction: string; //	Credit line for artworks still under copyright.	"© 2018 Estate of Pablo Picasso / Artists Rights Society (ARS), New York"
	linkResource: string; //	URL to object's page on metmuseum.org	"https://www.metmuseum.org/art/collection/search/547802"
	metadataDate: string; //	Date metadata was last updated	2018-10-17T10:24:43.197Z
	repository: string; //		"Metropolitan Museum of Art, New York, NY"
	objectURL: string; //	URL to object's page on metmuseum.org	"https://www.metmuseum.org/art/collection/search/547802"
	tags: MetCollectionTag[]; //	An array of subject keyword tags associated with the object and their respective AAT URL	[{"term": "Abstraction","AAT_URL": "http://vocab.getty.edu/page/aat/300056508","Wikidata_URL": "https://www.wikidata.org/wiki/Q162150"}]
	objectWikidata_URL: string; //	Wikidata URL for the object	"https://www.wikidata.org/wiki/Q432253"
	isTimelineWork: boolean; //	Whether the object is on the Timeline of Art History website	true
	GalleryNumber: string; //	Gallery number, where available	"131"
}

// ---- Entities ---------------------

export type MetCollectionObjectID = number;

export interface MetCollectionConstituent {
	constituentID: number;
	role: string; // "Artist";
	name: string; // "Filippino Lippi";
	constituentULAN_URL: string; // "http://vocab.getty.edu/page/ulan/500018029";
	constituentWikidata_URL: string; // "https://www.wikidata.org/wiki/Q296265";
	gender: "" | "Female"; // currently contains female designations only
}

export interface MetCollectionMeasurement {
	elementName: string; // "Frame"
	elementDescription: null | string; // "Temple Proper"
	elementMeasurements: {
		Depth: number; // 17.780035;
		Height: number; // 127.00025;
		Width: number; // 104.77521;
	};
}

export interface MetCollectionTag {
	term: string; // "Madonna and Child";
	AAT_URL: string; // "http://vocab.getty.edu/page/ia/901000052";
	Wikidata_URL: string; // "https://www.wikidata.org/wiki/Q9309699";
}
