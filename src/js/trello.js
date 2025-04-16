import TrelloState from './trello-state';

export default class Trello {
  constructor() {
    this._activeForm = undefined;
    this._board = undefined;
    this._cloneCard = undefined;
    this._container = undefined;
    this._draggableCard = undefined;
    this._draggableCardId = undefined;
    this._element = undefined;
    this._ghostCard = undefined;
    this._shiftCardByX = undefined;
    this._shiftCardByY = undefined;
    this._state = new TrelloState();

    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  addEventListeners() {
    this._container.addEventListener('click', this.onClick);
    this._container.addEventListener('mousedown', this.onMouseDown);
    this._container.addEventListener('mouseup', this.onMouseUp);
    this._element.addEventListener('mouseleave', this.onMouseLeave);
  }

  addGhostCard(event) {
    this._ghostCard.hidden = true;
    const elementCurrent = document.elementFromPoint(event.clientX, event.clientY);
    this._ghostCard.hidden = false;

    if (!elementCurrent) {
      return;
    }

    const targetCard = elementCurrent.closest(Trello.columnCardSelector);

    this._cloneCard = this._draggableCard.cloneNode(true);
    this._cloneCard.dataset.id = 'card-clone';

    if (elementCurrent.closest(Trello.columnBodySelector)) {
      if (!elementCurrent.closest(Trello.columnBodySelector).hasChildNodes()) {
        elementCurrent.closest(Trello.columnBodySelector).appendChild(this._cloneCard);
      }
      else if (targetCard && targetCard.dataset.id !== this._draggableCardId) {
        const { top } = elementCurrent.getBoundingClientRect();

        if (
          targetCard.previousElementSibling
          && targetCard.previousElementSibling.dataset.id === this._draggableCardId
        ) {
          elementCurrent.closest(Trello.columnBodySelector).insertBefore(
            this._cloneCard,
            elementCurrent.closest(Trello.columnCardSelector).nextElementSibling,
          );
        }

        if (
          targetCard.nextElementSibling
          && targetCard.nextElementSibling.dataset.id === this._draggableCardId
        ) {
          elementCurrent.closest(Trello.columnBodySelector).insertBefore(
            this._cloneCard,
            elementCurrent.closest(Trello.columnCardSelector),
          );
        }

        if (event.pageY > window.scrollY + top + elementCurrent.closest(Trello.columnCardSelector).offsetHeight / 2) {
          elementCurrent.closest(Trello.columnBodySelector).insertBefore(
            this._cloneCard,
            elementCurrent.closest(Trello.columnCardSelector).nextElementSibling,
          );
        }
        else {
          elementCurrent.closest(Trello.columnBodySelector).insertBefore(
            this._cloneCard,
            elementCurrent.closest(Trello.columnCardSelector),
          );
        }
      }
      else {
        const elementAbove = document.elementFromPoint(event.clientX, event.clientY - 30);
        const elementBelow = document.elementFromPoint(event.clientX, event.clientY + 40);

        if (elementBelow.closest(Trello.columnFooterSelector)) {
          elementCurrent.closest(Trello.columnBodySelector).appendChild(this._cloneCard);
        }
        else if (elementAbove.closest(Trello.columnHeaderSelector)) {
          elementCurrent.closest(Trello.columnBodySelector).prepend(this._cloneCard);
        }
      }
    }

    if (elementCurrent.closest(Trello.columnFooterSelector)) {
      const columnBody = elementCurrent
        .closest(Trello.boardColumnSelector)
        .querySelector(Trello.columnBodySelector);

      columnBody.scrollTop = columnBody.scrollHeight;
      columnBody.appendChild(this._cloneCard);
    }

    if (elementCurrent.closest(Trello.columnHeaderSelector)) {
      elementCurrent
        .closest(Trello.boardColumnSelector)
        .querySelector(Trello.columnBodySelector)
        .prepend(this._cloneCard);
    }
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }

    this._container = container;
  }

  checkBinding() {
    if (this._container === undefined) {
      throw new Error('Trello not bind to DOM');
    }
  }

  drawUI() {
    this.checkBinding();

    this._container.innerHTML = Trello.markup;
    this._element = this._container.querySelector(Trello.selector);
    this._board = this._element.querySelector(Trello.boardSelector);

    this._state.loadData();

    this.redrawDOM();
  }

  onClick(event) {
    if (event.target.closest(Trello.cardBtnDeleteSelector)) {
      return this.onClickCardBtnDelete(event);
    }
    else if (event.target.closest(Trello.columnBtnAddSelector)) {
      this.onClickColumnBtnAdd(event);
    }
    else if (event.target.closest(Trello.formBtnResetSelector)) {
      this.onResetForm(event);
    }
    else if (event.target.closest(Trello.formBtnSubmitSelector)) {
      return this.onSubmitForm(event);
    }
  }

  onClickCardBtnDelete(event) {
    const cardId = event.target.closest(Trello.columnCardSelector).dataset.id;
    const columnBody = event.target.closest(Trello.columnBodySelector);

    this._state.deleteDataItem(columnBody.dataset.name, cardId);

    this.redrawColumnBody(columnBody);

    this._state.saveData();
  }

  onClickColumnBtnAdd(event) {
    [...this._container.querySelectorAll(Trello.columnFooterSelector)]
      .forEach((columnFooter) => {
        columnFooter.querySelector(Trello.columnBtnAddSelector).classList.remove('hidden');
        columnFooter.querySelector(Trello.columnFormSelector).classList.add('hidden');
      });

    const column = event.target.closest(Trello.boardColumnSelector);
    const columnFooter = event.target.closest(Trello.columnFooterSelector);
    this._activeForm = columnFooter.querySelector(Trello.columnFormSelector);

    event.target.classList.add('hidden');
    this._activeForm.classList.remove('hidden');
    this._activeForm.querySelector(Trello.formTextareaSelector).focus();

    column.querySelector(Trello.columnBodySelector).style.maxHeight = (
      this._board.offsetHeight
      - column.querySelector(Trello.columnHeaderSelector).offsetHeight
      - columnFooter.offsetHeight
    ) + 'px';
  }

  onMouseDown(event) {
    event.preventDefault();

    const card = event.target.closest(Trello.columnCardSelector);

    if (!card || event.target.closest(Trello.cardBtnDeleteSelector)) {
      return;
    }

    document.body.style.cursor = 'grabbing';

    this._draggableCard = card;
    this._draggableCardId = this._draggableCard.id;

    const draggableCardCoordinates = this._draggableCard.getBoundingClientRect();
    this._shiftCardByX = event.clientX - draggableCardCoordinates.left;
    this._shiftCardByY = event.clientY - draggableCardCoordinates.top;

    this._ghostCard = this._draggableCard.cloneNode(true);
    this._ghostCard.classList.add('draggable');
    this._ghostCard.dataset.id = 'card-ghost';

    this._draggableCard.classList.add('darkened');

    document.querySelector(Trello.selector).appendChild(this._ghostCard);

    this._ghostCard.style.width = `${this._draggableCard.offsetWidth}px`;
    this._ghostCard.style.left = `${draggableCardCoordinates.left}px`;
    this._ghostCard.style.top = `${draggableCardCoordinates.top}px`;

    this._container.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseLeave() {
    if (!this._draggableCard) {
      return;
    }

    this._draggableCard.classList.remove('darkened');
    this._ghostCard.remove();

    document.body.style.cursor = 'auto';

    this._container.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(event) {
    event.preventDefault();

    if (document.querySelector('[data-id="card-clone"]')) {
      document.querySelector('[data-id="card-clone"]').remove();
    }

    if (!this._draggableCard) {
      return;
    }

    this._ghostCard.style.left = `${event.pageX - this._shiftCardByX}px`;
    this._ghostCard.style.top = `${event.pageY - this._shiftCardByY}px`;

    this.addGhostCard(event);
  }

  onMouseUp(event) {
    const elementCurrent = document.elementFromPoint(event.clientX, event.clientY);

    if (!this._draggableCard || elementCurrent.closest(Trello.cardBtnDeleteSelector)) {
      return;
    }

    let siblingData = undefined;

    if (
      this._cloneCard && (
        elementCurrent.closest(Trello.columnBodySelector)
        || elementCurrent.closest(Trello.columnFooterSelector)
        || elementCurrent.closest(Trello.columnHeaderSelector)
      )
    ) {
      if (this._cloneCard.nextElementSibling) {
        siblingData = {
          cardId: this._cloneCard.nextElementSibling.dataset.id,
          columnName: this._cloneCard.closest(Trello.columnBodySelector).dataset.name,
        };
      }
      else if (elementCurrent.closest('.darkened')) {
        if (elementCurrent.closest(Trello.columnCardSelector).nextElementSibling) {
          siblingData = {
            cardId: elementCurrent.closest(Trello.columnCardSelector).nextElementSibling.dataset.id,
            columnName: elementCurrent.closest(Trello.columnBodySelector).dataset.name,
          };
        }
        else {
          siblingData = {
            cardId: undefined,
            columnName: elementCurrent.closest(Trello.columnBodySelector).dataset.name,
          };
        }
      }
    }
    else {
      siblingData = undefined;
    }

    this._container.removeEventListener('mousemove', this.onMouseMove);

    this._state.moveDataItem(this._draggableCard, siblingData);

    this.redrawDOM();

    this._state.saveData();
  }

  onResetForm(event) {
    const column = event.target.closest(Trello.boardColumnSelector);
    const columnFooter = event.target.closest(Trello.columnFooterSelector);

    columnFooter.querySelector(Trello.columnBtnAddSelector).classList.remove('hidden');
    this._activeForm.classList.add('hidden');
    this._activeForm.querySelector(Trello.formTextareaSelector).value = '';

    column.querySelector(Trello.columnBodySelector).style.maxHeight = (
      this._board.offsetHeight
      - column.querySelector(Trello.columnHeaderSelector).offsetHeight
      - columnFooter.offsetHeight
    ) + 'px';

    this._activeForm = undefined;
  }

  onSubmitForm(event) {
    event.preventDefault();

    const textarea = this._activeForm.querySelector(Trello.formTextareaSelector);
    const title = textarea.value;

    if (title) {
      const columnBody = event.target
        .closest(Trello.boardColumnSelector)
        .querySelector(Trello.columnBodySelector);

      this._state.addDataItem(columnBody.dataset.name, title);

      this.redrawColumnBody(columnBody);

      event.target
        .closest(Trello.columnFooterSelector)
        .querySelector(Trello.columnBtnAddSelector)
        .classList.remove('hidden');
      this._activeForm.classList.add('hidden');
      textarea.value = '';

      this._state.saveData();

      this._activeForm = undefined;
    }
  }

  redrawColumnBody(columnBody) {
    const column = columnBody.closest(Trello.boardColumnSelector);

    columnBody.innerHTML = '';
    columnBody.style.maxHeight = (
      this._board.offsetHeight
      - column.querySelector(Trello.columnHeaderSelector).offsetHeight
      - column.querySelector(Trello.columnFooterSelector).offsetHeight
    ) + 'px';

    this._state.data[columnBody.dataset.name].forEach((element) => {
      columnBody.insertAdjacentHTML('beforeend', Trello.markupCard(element.id, element.title));
    });
  }

  redrawDOM() {
    if (document.querySelector('[data-id="card-ghost"]')) {
      document.querySelector('[data-id="card-ghost"]').remove();
    }

    if (document.querySelector('[data-id="card-clone"]')) {
      document.querySelector('[data-id="card-clone"]').remove();
    }

    this.redrawColumnBody(this._container.querySelector('[data-name="todo"]'));
    this.redrawColumnBody(this._container.querySelector('[data-name="in-progress"]'));
    this.redrawColumnBody(this._container.querySelector('[data-name="done"]'));

    document.body.style.cursor = 'auto';
  }

  static get markup() {
    return `
      <div class="trello">
        <div class="trello__board trello-board">
    `
      + Trello.markupColumn('todo', 'TODO')
      + Trello.markupColumn('in-progress', 'IN PROGRESS')
      + Trello.markupColumn('done', 'DONE')
      + `
        </div>
      </div>
    `;
  }

  static markupCard(id, title) {
    return `
      <article class="trello-column__card trello-card" data-id="${id}">
        <h3 class="trello-card__title">${title}</h3>
        <button class="trello-card__btn-delete">&#10006;</button>
      </article>
    `;
  }

  static markupColumn(name, title) {
    return `
      <section class="trello-board__column trello-column">
        <div class="trello-column__header">
          <h2 class="trello-column__title">${title}</h2>
        </div>
        <div class="trello-column__body" data-name="${name}"></div>
        <div class="trello-column__footer">
          <button class="trello-column__btn-add">&#10010; Add another card</button>
          <form class="trello-column__form trello-form hidden">
            <textarea class="trello-form__textarea" placeholder="Enter a title for this card..."></textarea>
            <div class="trello-form__controls">
              <button class="trello-form__btn-submit" type="submit">Add Card</button>
              <button class="trello-form__btn-reset" type="reset">&#10006;</button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  static get boardColumnSelector() { return '.trello-board__column'; }

  static get boardSelector() { return '.trello__board'; }

  static get cardBtnDeleteSelector() { return '.trello-card__btn-delete'; }

  static get columnBtnAddSelector() { return '.trello-column__btn-add'; }

  static get columnBodySelector() { return '.trello-column__body'; }

  static get columnCardSelector() { return '.trello-column__card'; }

  static get columnFooterSelector() { return '.trello-column__footer'; }

  static get columnFormSelector() { return '.trello-column__form'; }

  static get columnHeaderSelector() { return '.trello-column__header'; }

  static get formBtnResetSelector() { return '.trello-form__btn-reset'; }

  static get formBtnSubmitSelector() { return '.trello-form__btn-submit'; }

  static get formTextareaSelector() { return '.trello-form__textarea'; }

  static get selector() { return '.trello'; }
}
