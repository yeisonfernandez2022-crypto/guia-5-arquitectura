export class TasksView {
  constructor(root = document) {
    this.document = root.ownerDocument || root;
    this.form = root.querySelector("#task-form");
    this.titleInput = root.querySelector("#title");
    this.descriptionInput = root.querySelector("#description");
    this.taskList = root.querySelector("#task-list");
    this.message = root.querySelector("#message");
    this.apiStatus = root.querySelector("#api-status");
    this.refreshButton = root.querySelector("#refresh");
  }

  bind({ onCreate, onRefresh, onChangeStatus }) {
    this.form.addEventListener("submit", event => {
      event.preventDefault();
      onCreate({
        title: this.titleInput.value,
        description: this.descriptionInput.value
      });
    });

    this.refreshButton.addEventListener("click", onRefresh);

    this.taskList.addEventListener("click", event => {
      const button = event.target.closest("[data-save-id]");
      if (!button) return;

      const id = button.dataset.saveId;
      const select = this.taskList.querySelector(`[data-task-id="${id}"]`);
      if (select) onChangeStatus(id, select.value);
    });
  }

  renderTasks(tasks, statuses) {
    this.taskList.replaceChildren();

    if (!tasks.length) {
      this.renderTaskListMessage("No hay tareas todavía. Crea la primera.");
      return;
    }

    for (const task of tasks) {
      this.taskList.append(this.createTaskElement(task, statuses));
    }
  }

  createTaskElement(task, statuses) {
    const article = this.document.createElement("article");
    article.className = "task";

    const top = this.document.createElement("div");
    top.className = "task-top";

    const info = this.document.createElement("div");
    const title = this.document.createElement("h3");
    title.textContent = task.title;
    const description = this.document.createElement("p");
    description.textContent = task.description || "Sin descripción";
    info.append(title, description);

    const id = this.document.createElement("strong");
    id.textContent = `#${task.id}`;
    top.append(info, id);

    const actions = this.document.createElement("div");
    actions.className = "task-actions";

    const label = this.document.createElement("label");
    label.htmlFor = `status-${task.id}`;
    label.textContent = "Estado";

    const select = this.document.createElement("select");
    select.id = `status-${task.id}`;
    select.dataset.taskId = String(task.id);

    for (const status of statuses) {
      const option = this.document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = task.status === status;
      select.append(option);
    }

    const saveButton = this.document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "secondary";
    saveButton.dataset.saveId = String(task.id);
    saveButton.textContent = "Guardar estado";

    actions.append(label, select, saveButton);
    article.append(top, actions);

    return article;
  }

  renderTaskListMessage(text) {
    this.taskList.replaceChildren();
    const paragraph = this.document.createElement("p");
    paragraph.textContent = text;
    this.taskList.append(paragraph);
  }

  resetForm() {
    this.form.reset();
  }

  clearMessage() {
    this.message.textContent = "";
    this.message.className = "message";
  }

  showMessage(text, type = "error") {
    this.message.textContent = text;
    this.message.className = `message message--${type}`;
  }

  setApiStatus(text, type) {
    this.apiStatus.textContent = text;
    this.apiStatus.className = `status status--${type}`;
  }
}
