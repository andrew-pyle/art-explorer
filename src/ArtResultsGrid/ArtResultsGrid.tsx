import { TransitionGroup, CSSTransition } from "react-transition-group";
import { ArtworkT } from "../lib/types";
import { Artwork } from "../Artwork/Artwork";

import style from "./style.module.css";
import "./transition.css";

// Types

interface Props {
  results: ArtworkT[];
}

// Component

export function ArtResultsGrid({ results }: Props) {
  // 4 x 3 Cell Blocks
  const cellWidth = 200;
  const cellHeight = 200;

  return (
    <TransitionGroup component="ul" class={style["result-grid"]}>
      {results.map((art) => (
        <CSSTransition key={art.id} class="fade" timeout={500}>
          <li>
            <Artwork width={cellWidth} height={cellHeight} {...art} />
          </li>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}
