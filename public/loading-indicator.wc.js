class LoadingIndicator extends HTMLElement {
  template = /*html*/ `
    <style>
        :host {
            color: white;
          }
        svg { 
          width: 1em;
          animation: spin 1.25s infinite;
        }
        :host([hidden]) {
            display: none;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(540deg);
          }
        }
    </style>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="currentColor" />
    </svg>
    <slot></slot>
  `;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = this.template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define("loading-indicator", LoadingIndicator);
