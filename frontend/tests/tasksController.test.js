import test from "node:test";
import assert from "node:assert/strict";
import { TasksController } from "../src/controllers/tasksController.js";
import { ApiError } from "../src/api/taskApi.js";

function createHarness() {
  const calls = {
    bound: null,
    tasks: null,
    statuses: null,
    apiStatus: null,
    rendered: null,
    taskListMessage: null,
    messages: [],
    resets: 0,
    cleared: 0
  };

  const api = {
    tasks: [{ id: 1, title: "Tarea existente", status: "pendiente" }],
    statuses: ["pendiente", "finalizada"],
    created: null,
    changed: null,
    listTasksCalls: 0,
    async listTasks() {
      this.listTasksCalls += 1;
      return this.tasks;
    },
    async listStatuses() {
      return this.statuses;
    },
    async createTask(payload) {
      this.created = payload;
      return { id: 2, ...payload, status: "pendiente" };
    },
    async changeStatus(id, status) {
      this.changed = { id, status };
    }
  };

  const model = {
    setTasks(tasks) { calls.tasks = tasks; },
    setStatuses(statuses) { calls.statuses = statuses; },
    getTasks() { return [...(calls.tasks || [])]; },
    getStatuses() { return [...(calls.statuses || [])]; }
  };

  const view = {
    bind(handlers) { calls.bound = handlers; },
    setApiStatus(text, type) { calls.apiStatus = { text, type }; },
    renderTasks(tasks, statuses) { calls.rendered = { tasks, statuses }; },
    renderTaskListMessage(text) { calls.taskListMessage = text; },
    showMessage(text, type) { calls.messages.push({ text, type }); },
    clearMessage() { calls.cleared += 1; },
    resetForm() { calls.resets += 1; }
  };

  const controller = new TasksController({ api, model, view });
  return { api, calls, controller };
}

test("init conecta la vista y carga tareas y estados", async () => {
  const { api, calls, controller } = createHarness();

  await controller.init();

  assert.ok(calls.bound);
  assert.equal(api.listTasksCalls, 1);
  assert.deepEqual(calls.statuses, ["pendiente", "finalizada"]);
  assert.deepEqual(calls.rendered.tasks, api.tasks);
  assert.deepEqual(calls.apiStatus, { text: "API conectada", type: "ok" });
});

test("createTask crea, limpia el formulario y recarga", async () => {
  const { api, calls, controller } = createHarness();

  await controller.createTask({ title: "Nueva tarea", description: "" });

  assert.deepEqual(api.created, { title: "Nueva tarea", description: "" });
  assert.equal(calls.resets, 1);
  assert.deepEqual(calls.messages.at(-1), {
    text: "Tarea creada correctamente.",
    type: "success"
  });
  assert.equal(api.listTasksCalls, 1);
});

test("createTask muestra el error de validación sin marcar la API como caída", async () => {
  const { api, calls, controller } = createHarness();
  api.createTask = async () => {
    throw new ApiError("El título debe tener al menos 3 caracteres.", 400);
  };

  await controller.createTask({ title: "ab" });

  assert.deepEqual(calls.messages.at(-1), {
    text: "El título debe tener al menos 3 caracteres.",
    type: "error"
  });
  assert.equal(calls.apiStatus, null);
  assert.equal(calls.resets, 0);
});

test("load informa cuando la API no está disponible", async () => {
  const { api, calls, controller } = createHarness();
  api.listTasks = async () => {
    throw new ApiError("No se pudo conectar con la API.");
  };

  await controller.load();

  assert.deepEqual(calls.apiStatus, { text: "API no disponible", type: "error" });
  assert.match(calls.taskListMessage, /Verifica que el backend esté iniciado/);
  assert.match(calls.messages.at(-1).text, /No se pudo conectar con la API/);
});

test("changeStatus delega en la API y recarga las tareas", async () => {
  const { api, controller } = createHarness();

  await controller.changeStatus(1, "finalizada");

  assert.deepEqual(api.changed, { id: 1, status: "finalizada" });
  assert.equal(api.listTasksCalls, 1);
});
