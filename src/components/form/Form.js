import "./form.css";
import Card from "../card/Card";
/* <form class="form hidden">
            <label class="visually-hidden">Enter your task</label>
            <textarea class="form__textarea" id="add-card" placeholder="Enter your task here..."></textarea>
          </form> */

export default class Form {
  constructor() {
    this.element = document.createElement("form");
    this.element.classList.add("form", "hidden");

    this.label = document.createElement("label");
    this.label.classList.add("visually-hidden");
    this.label.for = "add-card";
    this.label.textContent = "Enter a title for this card";

    this.textarea = document.createElement("textarea");
    this.textarea.classList.add("form__textarea");
    this.textarea.id = "add-card";
    this.textarea.placeholder = "Enter your task here...";

    this.tooltip = document.createElement("div");
    this.tooltip.classList.add("tooltip", "hidden");

    this.footer = document.createElement("div");
    this.footer.classList.add("form__footer");

    this.buttons = document.createElement("div");
    this.buttons.classList.add("form__buttons");

    this.addButton = document.createElement("button");
    this.addButton.classList.add("form__add");
    this.addButton.type = "submit";
    this.addButton.textContent = "Add Card";

    this.closeButton = document.createElement("div");
    this.closeButton.classList.add("form__close");

    this.buttons.append(this.addButton, this.closeButton);

    this.footer.append(this.buttons);

    this.element.append(this.label, this.textarea, this.tooltip, this.footer);

    this.addEventListeners();
  }

  addEventListeners() {
    this.closeButton.addEventListener(
      "click",
      this.clickOnCloseForm.bind(this),
    );
    this.element.addEventListener("submit", this.clickOnSubmitForm.bind(this));
    this.textarea.addEventListener("input", this.onInput.bind(this));
    this.textarea.addEventListener("focus", () => {
      console.log("Textarea focused");
    });
  }

  render(previousSelector) {
    const previousElement = document.querySelector(previousSelector);
    previousElement.after(this.element);
  }

  hideTooltip() {
    this.tooltip.classList.add("hidden");
  }

  showTooltip() {
    this.tooltip.classList.remove("hidden");
  }

  showForm() {
    this.element.classList.remove("hidden");
  }

  closeForm() {
    this.textarea.value = "";
    this.element.classList.add("hidden");
    const button = this.element.nextElementSibling;
    button.classList.remove("hidden");
    this.hideTooltip();
  }

  clickOnSubmitForm(event) {
    event.preventDefault();

    const message = this.textarea.value;

    if (!message) {
      this.tooltip.textContent = "Введите текст или закройте окно";
      this.showTooltip();
      return;
    }

    const cardList = [...document.querySelectorAll(".cards__item")];
    const beforeAddedCard = cardList.some(
      (card) => card.textContent === message,
    );

    if (beforeAddedCard) {
      this.tooltip.textContent = "Такая задача уже есть!";
      this.showTooltip();
    } else {
      const card = new Card(message);
      const column = this.element.closest(".column");
      const attribute = column.dataset.title;
      card.addCard(`[data-title="${attribute}"] .cards`);
      this.closeForm();
    }
  }

  clickOnCloseForm() {
    this.closeForm();
  }
  onInput() {
    this.hideTooltip();
  }
}
