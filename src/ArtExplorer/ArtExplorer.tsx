import { Component, Fragment } from "preact";
import { MetMuseumCollection } from "../lib/MetMuseumCollection";
import { ArtSearch } from "../ArtSearch/ArtSearch";
import { ArtResultsGrid } from "../ArtResultsGrid/ArtResultsGrid";
import { ArtworkSearchHandler, ArtworkT } from "../lib/types";
import { parseArtwork } from "../lib/utils";
import style from "./style.module.css";

// Constants

const metMuseumCollection = new MetMuseumCollection();

// Types

type Props = {};

interface State {
  userNotice: string;
  artworks: ArtworkT[];
}

// Component

export class ArtExplorer extends Component<Props, State> {
  state: State = {
    userNotice: "",
    artworks: [],
  };

  searchMetMuseumApi: ArtworkSearchHandler = async (query, options) => {
    try {
      // Set Loading
      this.setState({ userNotice: "Loading..." });

      // Do Search
      const resultListPromises = await metMuseumCollection.explore(
        query,
        options
      );

      // // Attach listener to asynchronously append each artwork as it's
      // // promise settles. We must request each artwork data separately.
      // for (const resultPromise of resultListPromises) {
      // 	resultPromise
      // 		.then((result) => {
      // 			const artwork: ArtworkT = parseArtwork(result);

      // 			this.setState((prevState) => {
      // 				const prevArtworks = new Set(prevState.artworks);
      // 				const newArtworks = prevArtworks.add(artwork); // prevent duplication
      // 				const sortedArtworks = Array.from(newArtworks).sort(
      // 					(a, b) => (a.year = b.year),
      // 				);
      // 				return {
      // 					artworks: sortedArtworks,
      // 				};
      // 			});
      // 		})
      // 		.catch(() => {
      // 			// Let any one result fail silently.
      // 		});
      // }

      // Remove artworks which aren't in the results
      this.setState((prevState) => {
        const newArtworks = new Set(resultListPromises.map((p) => p.id));
        const stillMatchingArtworks = prevState.artworks.filter((old) =>
          newArtworks.has(old.id)
        );
        return {
          artworks: stillMatchingArtworks,
        };
      });

      // Let any one result fail silently.
      const artworks = (
        await Promise.allSettled(resultListPromises.map((r) => r.artwork))
      )
        .filter(isFulfilled)
        .map((p) => parseArtwork(p.value))
        .filter((a) => a.imgSrc);

      // // End Loading only after all results are loaded
      // await Promise.allSettled(resultListPromises);
      // if (resultListPromises.length === 0) {
      if (artworks.length === 0) {
        this.setState({
          userNotice: "😭 No results in the Met Museum Open Access Collection.",
        });
        return;
      }

      // Update state

      // this.setState({ userNotice: "" });
      this.setState((prevState) => {
        const newArtworks = new Set(prevState.artworks);
        // Add all new artworks, using Set to prevent duplication
        for (const artwork of artworks) {
          newArtworks.add(artwork);
        }
        const sortedArtworks = Array.from(newArtworks).sort(
          (a, b) => (a.year = b.year)
        );
        return {
          userNotice: "", // Clear loading notice
          artworks: sortedArtworks,
        };
      });
    } catch (err) {
      console.error(err);
      // User Notice
      this.setState({
        userNotice: "😰 We are having trouble at the moment. Sorry!",
      });
    }
  };

  render() {
    return (
      <Fragment>
        <h1>Art Timeline</h1>
        <p>
          Explore Representations in Art through Time With the Met Museum of
          Art's Open Access Collection
        </p>
        <h2>Search</h2>
        <div class={style["sticky-top-bar"]}>
          <ArtSearch onSubmit={this.searchMetMuseumApi} />
          <hr />
        </div>
        <div class={style["title-bar"]}>
          <h2>Results</h2>
          {this.state.userNotice ? (
            <p class={style["user-notice"]}>{this.state.userNotice}</p>
          ) : null}
        </div>
        <ArtResultsGrid results={this.state.artworks} />
      </Fragment>
    );
  }
}

function isFulfilled<T>(
  p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> {
  return p.status === "fulfilled";
}
