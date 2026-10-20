import { ApiError } from "../api/taskApi.js";

export class TasksController {
  constructor({ api, model, view }) {
    this.api = api;
    this.model = model;
    this.view = view;
  }

  async init() {
    this.view.bind({
      onCreate: input => this.createTask(input),
      onRefresh: () => this.load(),
      onChangeStatus: (id, status) => this.changeStatus(id, status)
    });

    await this.load();
  }

  async load() {
    try {
      const [tasks, statuses] = await Promise.all([
        this.api.listTasks(),
        this.api.listStatuses()
      ]);

      this.model.setTasks(tasks);
      this.model.setStatuses(statuses);
      this.view.setApiStatus("API conectada", "ok");
      this.view.renderTasks(this.model.getTasks(), this.model.getStatuses());
    } catch (error) {
      this.handleError(error, true);
    }
  }

  async createTask(input) {
    this.view.clearMessage();

    try {
      await this.api.createTask(input);
      this.view.resetForm();
      this.view.showMessage("Tarea creada correctamente.", "success");
      await this.load();
    } catch (error) {
      this.handleError(error, false);
    }
  }

  async changeStatus(id, status) {
    try {
      await this.api.changeStatus(id, status);
      await this.load();
    } catch (error) {
      this.handleError(error, false);
    }
  }

  handleError(error, isLoading) {
    const message = error instanceof ApiError
      ? error.message
      : "Ocurrió un error inesperado.";
    const connectionError = !(error instanceof ApiError) || !error.status;

    if (connectionError) {
      const detail = `${message}. Verifica que el backend esté iniciado.`;
      this.view.setApiStatus("API no disponible", "error");
      this.view.showMessage(detail, "error");
      if (isLoading) this.view.renderTaskListMessage(detail);
      return;
    }

    this.view.showMessage(message, "error");
  }
}
