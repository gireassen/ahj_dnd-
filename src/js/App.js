import Trello from './trello';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#app');

  const trello = new Trello();
  trello.bindToDOM(container);
  trello.drawUI();
  trello.addEventListeners();

  // Template card title: 'Welcome to Trello!'
});
