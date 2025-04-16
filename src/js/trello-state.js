export default class TrelloState {
  constructor() { this.data = { 'todo': [], 'in-progress': [], 'done': [] }; }

  addDataItem(columnName, cardTitle) {
    this.data[columnName].push({ id: 'card-' + Date.now(), title: cardTitle });
  }

  deleteDataItem(columnName, cardId) {
    const index = this.data[columnName].findIndex(item => item.id === cardId);

    this.data[columnName].splice(index, 1);
  }

  loadData() {
    if (localStorage.getItem('trello-state')) {
      this.data = JSON.parse(localStorage.getItem('trello-state'));
    }
  }

  moveDataItem(draggableCard, siblingData) {
    if (siblingData) {
      [this.data['todo'], this.data['in-progress'], this.data['done']].forEach((items) => {
        const draggableIndex = items.findIndex(item => item.id === draggableCard.dataset.id);

        if (draggableIndex !== -1) {
          const draggableItem = items[draggableIndex];

          items.splice(draggableIndex, 1);

          if (siblingData.cardId) {
            const siblingIndex = this.data[siblingData.columnName].findIndex((item) => {
              return item.id === siblingData.cardId;
            });

            this.data[siblingData.columnName].splice(siblingIndex, 0, draggableItem);
          }
          else {
            this.data[siblingData.columnName].push(draggableItem);
          }
        }
      });
    }
  }

  saveData() {
    localStorage.setItem('trello-state', JSON.stringify(this.data));
  }
}
