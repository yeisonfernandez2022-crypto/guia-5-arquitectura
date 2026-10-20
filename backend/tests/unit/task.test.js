const test = require("node:test");
const assert = require("node:assert/strict");
const { Task } = require("../../src/domain/Task");
const { ValidationError } = require("../../src/domain/errors");

test("Task.create normaliza el título y usa el estado pendiente", () => {
  const task = Task.create({ title: "  Crear diagrama  ", description: "  Arquitectura  " });

  assert.equal(task.title, "Crear diagrama");
  assert.equal(task.description, "Arquitectura");
  assert.equal(task.status, "pendiente");
  assert.equal(task.id, null);
  assert.ok(task.createdAt);
  assert.ok(task.updatedAt);
});

test("Task.create convierte una descripción nula en cadena vacía", () => {
  const task = Task.create({ title: "Tarea válida", description: null });

  assert.equal(task.description, "");
});

test("Task.create rechaza títulos inválidos", () => {
  assert.throws(() => Task.create({ title: "ab" }), ValidationError);
  assert.throws(() => Task.create({ title: 123 }), ValidationError);
  assert.throws(() => Task.create({}), ValidationError);
});

test("Task.fromPersistence conserva los datos originales", () => {
  const data = {
    id: 7,
    title: "Tarea persistida",
    description: "Descripción",
    status: "finalizada",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z"
  };

  const task = Task.fromPersistence(data);

  assert.deepEqual(task.toObject(), data);
});

test("Task.fromPersistence rechaza estados inválidos", () => {
  assert.throws(
    () => Task.fromPersistence({ id: 1, title: "Tarea válida", status: "archivada" }),
    ValidationError
  );
});

test("Task.changeStatus valida y actualiza el estado", () => {
  const task = Task.create({ title: "Tarea válida" });

  task.changeStatus("en progreso");

  assert.equal(task.status, "en progreso");
  assert.throws(() => task.changeStatus("archivada"), ValidationError);
});

test("Task.clone devuelve una instancia independiente", () => {
  const task = Task.fromPersistence({
    id: 1,
    title: "Tarea original",
    description: "Original",
    status: "pendiente",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  });
  const clone = task.clone();

  clone.changeStatus("finalizada");

  assert.equal(task.status, "pendiente");
  assert.equal(clone.status, "finalizada");
  assert.notEqual(task, clone);
});
