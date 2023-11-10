import { Component, Fragment } from "preact";
import { ArtResultsGrid } from "../ArtResultsGrid/ArtResultsGrid";
import { ArtSearch } from "../ArtSearch/ArtSearch";
import { AbortError, MetMuseumCollection } from "../lib/MetMuseumCollection";
import type { MetCollectionObjectResponse } from "../lib/MetMuseumCollectionTypes";
import { ArtworkSearchHandler, ArtworkT } from "../lib/types";
import { parseArtwork } from "../lib/utils";
import style from "./style.module.css";

// Constants

const metMuseumCollection = new MetMuseumCollection();

// Types

type Props = {
	// No Props
	[x: string]: never;
};

interface State {
	userNotice: string;
	loading: boolean;
	artworks: ArtworkT[];
}

// Component

export class ArtExplorer extends Component<Props, State> {
	state: State = {
		userNotice: "",
		loading: false,
		artworks: [],
	};

	/** Stored as a bare class property, and not in state, for two reasons.
	 * 1. `setState()` is asynchronous, so we can accidentally pass a reference to an
	 *    old `AbortController` between renders.
	 * 2. If the state contains an old `AbortController`, the `abort()` function
	 *    will not cancel the currently working query.
	 *
	 * Limitation: Only one AbortController reference can be held at any given time.
	 */
	inflightController?: AbortController;

	searchMetMuseumApi: ArtworkSearchHandler = async (query, options) => {
		try {
			// Set Loading
			this.setState({ userNotice: "Loading...", loading: true });

			// Pull the old kill-switch
			this.inflightController?.abort();

			// Create a kill-switch for the new query
			this.inflightController = new AbortController();

			// Do Search
			const resultListPromises = await metMuseumCollection.explore(query, {
				...options,
				signal: this.inflightController.signal,
			});

			// TODO. Just Use Set() in the state
			// Remove artworks which aren't in the new results set
			this.setState((prevState) => {
				const newArtworks = new Set(resultListPromises.map((p) => p.id));
				const stillMatchingArtworks = prevState.artworks.filter((old) =>
					newArtworks.has(old.id),
				);
				return {
					artworks: stillMatchingArtworks,
				};
			});

			// Update the state asynchronously as each Request settles.
			// Each Request represents an artwork and is independent of the others.
			// Non-awaiting code. Always moves on.
			for (const { artwork } of resultListPromises) {
				artwork
					.then((response) => this.updateResults(response))
					// Let any one Request fail silently.
					.catch((err) => console.error(err));
			}

			// Also await the entire Request set to end
			// Loading only after all Requests have settled.
			// Awaiting code. Stops here until all requests have settled.
			const artworks = await Promise.allSettled(
				resultListPromises.map((r) => r.artwork),
			);

			// No Results Error View
			if (artworks.length === 0) {
				this.setState({
					loading: false,
					userNotice: "😭 No results in the Met Museum Open Access Collection.",
				});
				// Clear AbortController after empty query settles
				this.inflightController = undefined;
				return;
			}

			// Success View
			this.setState({
				loading: false,
				userNotice: "", // clear loading notice
			});
			// Also Clear AbortController after successful query settles
			this.inflightController = undefined;
		} catch (err) {
			// Unknown Error View
			console.error(err);

			if (err instanceof AbortError) {
				this.setState({
					userNotice: "Cancelling previous query.",
				});
				return;
			}

			// User Notice
			this.setState({
				loading: false,
				userNotice: "😰 We are having trouble at the moment. Sorry!",
			});
		}
	};

	updateResults = async (response: MetCollectionObjectResponse) => {
		try {
			const artwork = parseArtwork(response);
			if (!artwork.imgSrc) {
				// Some results from the MET API do not have an image.
				// Skip these silently.
				throw new Error(
					`Skipping Result because it has no image src: ${JSON.stringify(
						artwork,
					)}`,
				);
			}

			// Append the artwork to the results set
			this.setState((prevState) => {
				const prevArtworks = new Set(prevState.artworks);
				const newArtworks = prevArtworks.add(artwork); // prevent duplication
				const sortedArtworks = Array.from(newArtworks).sort(
					(a, b) => a.year - b.year,
				);
				return {
					artworks: sortedArtworks,
				};
			});
		} catch (err) {
			console.log(err);

			if (err instanceof AbortError) {
				// Do not add the aborted promise to the view
				// NoOp.
				// const x = 1; // Debug
			}

			// Let any one result fail silently.
		}
	};

	render() {
		return (
			<Fragment>
				<div class={style.wrapper}>
					<h1>Art Timeline</h1>
					<p>
						Explore Representations in Art through Time With the Met Museum of
						Art's Open Access Collection
					</p>
					<h2>Search</h2>
				
				<div class={style["sticky-top-bar"]}>
					<ArtSearch onSubmit={this.searchMetMuseumApi} />
					{/* Debug */}
					{/* <button
						type="button"
						onClick={() => {
							this.searchMetMuseumApi("woman", {
								minYear: 1600,
								maxYear: 2100,
							});
							setTimeout(() => {
								this.searchMetMuseumApi("woman", {
									minYear: 1500,
									maxYear: 1599,
								});
							}, 1_500);
						}}
					>
						Debug AbortControllers
					</button> */}
					<hr />
				</div>
				</div>
				<div class={style["title-bar"]}>
					<h2>Results</h2>
					{this.state.userNotice ? (
						<p class={style["user-notice"]}>{this.state.userNotice}</p>
					) : null}
					{this.state.loading ? <loading-indicator /> : null}
					{this.inflightController ? (
						<button
							type="button"
							onClick={() => this.inflightController?.abort()}
						>
							Cancel
						</button>
					) : null}
				</div>
				<ArtResultsGrid results={this.state.artworks} />
			</Fragment>
		);
	}
}
