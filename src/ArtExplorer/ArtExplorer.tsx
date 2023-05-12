import { Component, Fragment } from "preact";
import { MetMuseumCollection } from "../lib/MetMuseumCollection";
import { ArtSearch } from "../ArtSearch/ArtSearch";
import { ArtResultsGrid } from "../ArtResultsGrid/ArtResultsGrid";
import { ArtworkSearchHandler, ArtworkT } from "../lib/types";
import { parseArtwork } from "../lib/utils";
import type { MetCollectionObjectResponse } from "../lib/MetMuseumCollectionTypes";
import style from "./style.module.css";

// Constants

const metMuseumCollection = new MetMuseumCollection();

// Types

type Props = {};

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

  searchMetMuseumApi: ArtworkSearchHandler = async (query, options) => {
    try {
      // Set Loading
      this.setState({ userNotice: "Loading...", loading: true });

      // Do Search
      const resultListPromises = await metMuseumCollection.explore(
        query,
        options
      );

      // TODO. Use Set()
      // Remove artworks which aren't in the new results set
      this.setState((prevState) => {
        const newArtworks = new Set(resultListPromises.map((p) => p.id));
        const stillMatchingArtworks = prevState.artworks.filter((old) =>
          newArtworks.has(old.id)
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
        resultListPromises.map((r) => r.artwork)
      );

      // No Results Error View
      if (artworks.length === 0) {
        this.setState({
          loading: false,
          userNotice: "😭 No results in the Met Museum Open Access Collection.",
        });
        return;
      }

      // Success View
      this.setState({
        loading: false,
        userNotice: "", // clear loading notice
      });
    } catch (err) {
      // Unknown Error View
      console.error(err);
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
            artwork
          )}`
        );
      }

      // Append the artwork to the results set
      this.setState((prevState) => {
        const prevArtworks = new Set(prevState.artworks);
        const newArtworks = prevArtworks.add(artwork); // prevent duplication
        const sortedArtworks = Array.from(newArtworks).sort(
          (a, b) => (a.year = b.year)
        );
        return {
          artworks: sortedArtworks,
        };
      });
    } catch (err) {
      console.log(err);
      // Let any one result fail silently.
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
          {this.state.loading ? <loading-indicator /> : null}
        </div>
        <ArtResultsGrid results={this.state.artworks} />
      </Fragment>
    );
  }
}
