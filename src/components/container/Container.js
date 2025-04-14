import "./container.css";

export default class Container {
  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("container");
  }
}
