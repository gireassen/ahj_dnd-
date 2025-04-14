import cardsBase from "./cardsBase";

export default class Storage {
  constructor() {
    // localStorage.clear(); // чтобы снова отрисовать все сообщения из заготовки
    this.formData = {};
    this.getStorage();
    window.addEventListener("beforeunload", this.setStorage.bind(this)); // перед закрытием страницы
  }

  // чтение данных из localStorage:
  getStorage() {
    if (!localStorage.getItem("formdata")) {
      this.formData = structuredClone(cardsBase);
    } else {
      const json = localStorage.getItem("formdata");
      try {
        this.formData = JSON.parse(json) || {};
      } catch (error) {
        this.formData = {};
      }
    }
  }

  // запись данных в localStorage:
  setStorage() {
    const columns = document.querySelectorAll(".column");

    columns.forEach((column) => {
      const key = column.dataset.title;
      const value = [];

      const cardList = column.querySelectorAll(".cards__item");
      cardList.forEach((card) => {
        value.push(card.textContent);
      });

      this.formData[key] = value;
    });

    localStorage.setItem("formdata", JSON.stringify(this.formData));
  }
}
