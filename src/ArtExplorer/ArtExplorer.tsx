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
      // Reset state
      this.setState({ userNotice: "Loading...", artworks: [] });

      // Do Search
      const resultListPromises = await metMuseumCollection.explore(
        query,
        options
      );

      for (const resultPromise of resultListPromises) {
        resultPromise
          .then((result) => {
            const artwork: ArtworkT = parseArtwork(result);

            this.setState((prevState) => ({
              artworks: [...prevState.artworks, artwork],
            }));
          })
          .catch(() => {
            // Let any one result fail silently.
          });
      }

      // End Loading only after all results are loaded
      await Promise.allSettled(resultListPromises);
      if (resultListPromises.length === 0) {
        this.setState({
          userNotice: "😭 No results in the Met Museum Open Access Collection.",
        });
      } else {
        this.setState({ userNotice: "" });
      }
    } catch (err) {
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
        <h2>Results</h2>
        {this.state.userNotice ? <p>{this.state.userNotice}</p> : null}
        <ArtResultsGrid results={this.state.artworks} />
      </Fragment>
    );
  }
}
