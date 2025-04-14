import Column from "../components/column/Column";
import Container from "../components/container/Container";
import Storage from "./Storage";
import DragAndDrop from "./DragandDrop";

export default class App {
  constructor() {
    this.wrapper = document.querySelector(".wrapper");

    this.container = new Container();

    this.columnTodo = new Column("todo", "todo");
    this.columnProgress = new Column("in progress", "inprogress");
    this.columnDone = new Column("done", "done");

    this.dragAndDrop = new DragAndDrop();
    this.storage = new Storage();
  }

  init() {
    this.render();
  }

  render() {
    this.wrapper.append(this.container.element);

    const data = this.storage.formData;

    this.columnTodo.render(".container", data);
    this.columnProgress.render(".container", data);
    this.columnDone.render(".container", data);
  }
}
