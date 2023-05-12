import "preact";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "loading-indicator": HTMLAttributes;
    }
  }
}
