export class Controls {
  constructor(type) {
    this.forward = "DUMMY" === type ? true : false;
    this.reverse = false;
    this.left = false;
    this.right = false;
    "KEYS" === type && this.#addKeyboardListeners();
  }

  #setMovement(key, bool) {
    if (key === "ArrowUp") this.forward = bool;
    if (key === "ArrowDown") this.reverse = bool;
    if (key === "ArrowLeft") this.left = bool;
    if (key === "ArrowRight") this.right = bool;
  }

  #addKeyboardListeners() {
    document.onkeydown = ({ key }) => this.#setMovement(key, true);
    document.onkeyup = ({ key }) => this.#setMovement(key, false);
  }
}
