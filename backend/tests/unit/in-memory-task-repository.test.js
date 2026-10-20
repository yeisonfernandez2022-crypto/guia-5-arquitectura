const test = require("node:test");
const assert = require("node:assert/strict");
const { Task } = require("../../src/domain/Task");
const { InMemoryTaskRepository } = require("../../src/infrastructure/InMemoryTaskRepository");

const seed = [
  { id: 1, title: "Tarea uno", description: "Primera", status: "pendiente" },
  { id: 2, title: "Tarea dos", description: "Segunda", status: "en progreso" }
];

test("findAll devuelve las tareas semilla", () => {
  const repository = new InMemoryTaskRepository(seed);

  const tasks = repository.findAll();

  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks.map(task => task.id), [1, 2]);
});

test("findAll devuelve copias que no alteran el almacenamiento", () => {
  const repository = new InMemoryTaskRepository(seed);

  const tasks = repository.findAll();
  tasks[0].changeStatus("finalizada");
  tasks.pop();

  assert.equal(repository.findAll().length, 2);
  assert.equal(repository.findById(1).status, "pendiente");
});

test("findById devuelve una copia de la tarea", () => {
  const repository = new InMemoryTaskRepository(seed);

  const task = repository.findById(1);
  task.changeStatus("finalizada");

  assert.equal(repository.findById(1).status, "pendiente");
});

test("save asigna identificadores consecutivos a tareas nuevas", () => {
  const repository = new InMemoryTaskRepository(seed);

  const created = repository.save(Task.create({ title: "Tarea nueva" }));

  assert.equal(created.id, 3);
  assert.equal(repository.findAll().length, 3);
});

test("save actualiza una tarea existente sin crear otra", () => {
  const repository = new InMemoryTaskRepository(seed);
  const task = repository.findById(2);
  task.changeStatus("finalizada");

  const updated = repository.save(task);

  assert.equal(updated.id, 2);
  assert.equal(updated.status, "finalizada");
  assert.equal(repository.findAll().length, 2);
});
