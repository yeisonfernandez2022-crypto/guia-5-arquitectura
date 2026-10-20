import test from "node:test";
import assert from "node:assert/strict";
import { TasksModel } from "../src/models/tasksModel.js";

test("setTasks guarda copias de las tareas", () => {
  const model = new TasksModel();
  const tasks = [{ id: 1, title: "Tarea", status: "pendiente" }];

  model.setTasks(tasks);
  tasks[0].title = "Modificada";

  assert.equal(model.getTasks()[0].title, "Tarea");
  assert.notEqual(model.getTasks()[0], tasks[0]);
});

test("setStatuses guarda una copia de los estados", () => {
  const model = new TasksModel();
  const statuses = ["pendiente", "finalizada"];

  model.setStatuses(statuses);
  statuses.push("otro");

  assert.deepEqual(model.getStatuses(), ["pendiente", "finalizada"]);
});

test("setTasks y setStatuses ignoran valores que no son arreglos", () => {
  const model = new TasksModel();

  model.setTasks(null);
  model.setStatuses(undefined);

  assert.deepEqual(model.getTasks(), []);
  assert.deepEqual(model.getStatuses(), []);
});
