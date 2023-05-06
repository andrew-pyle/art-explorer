import type { ArtworkT } from "../lib/types";
import style from "./style.module.css";
// Types

interface Props extends ArtworkT {
  width: number;
  height: number;
}

// Component

export function Artwork({ imgSrc, width, height, alt, link, title }: Props) {
  return (
    <a href={link} class={style.artwork}>
      <img
        class={style["artwork-img"]}
        src={imgSrc?.toString()}
        width={width}
        height={height}
        alt={alt}
      />
      {title.length > 0 ? (
        <span class={style["artwork-title"]}>{title}</span>
      ) : null}
    </a>
  );
}
