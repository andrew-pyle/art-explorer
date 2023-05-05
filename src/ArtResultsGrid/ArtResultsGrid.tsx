import { ArtworkT } from "../lib/types";
import { Artwork } from "../Artwork/Artwork";

import style from "./style.module.css";

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
    <ul class={style["result-grid"]}>
      {results.map((art) => (
        <li key={art.id}>
          <Artwork width={cellWidth} height={cellHeight} {...art} />
        </li>
      ))}
    </ul>
  );
}
