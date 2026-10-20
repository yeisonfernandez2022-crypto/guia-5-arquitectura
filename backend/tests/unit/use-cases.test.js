const test = require("node:test");
const assert = require("node:assert/strict");
const { Task } = require("../../src/domain/Task");
const { ValidationError, NotFoundError } = require("../../src/domain/errors");
const { ListTasks } = require("../../src/application/use-cases/ListTasks");
const { CreateTask } = require("../../src/application/use-cases/CreateTask");
const { ChangeTaskStatus } = require("../../src/application/use-cases/ChangeTaskStatus");
const { GetTaskStatuses } = require("../../src/application/use-cases/GetTaskStatuses");

class FakeTaskRepository {
  constructor() {
    this.tasks = new Map();
    this.nextId = 1;
    this.saveCalls = 0;
  }

  findAll() {
    return [...this.tasks.values()].map(task => task.clone());
  }

  findById(id) {
    const task = this.tasks.get(Number(id));
    return task ? task.clone() : null;
  }

  save(task) {
    const id = task.id ?? this.nextId++;
    const stored = Task.fromPersistence({ ...task.toObject(), id });
    this.tasks.set(id, stored);
    this.saveCalls += 1;
    return stored.clone();
  }
}

test("CreateTask crea y persiste una tarea válida", () => {
  const repository = new FakeTaskRepository();
  const useCase = new CreateTask(repository);

  const task = useCase.execute({ title: "  Nueva tarea  ", description: "Detalle" });

  assert.equal(task.id, 1);
  assert.equal(task.title, "Nueva tarea");
  assert.equal(task.description, "Detalle");
  assert.equal(task.status, "pendiente");
  assert.equal(repository.saveCalls, 1);
});

test("CreateTask no persiste tareas inválidas", () => {
  const repository = new FakeTaskRepository();
  const useCase = new CreateTask(repository);

  assert.throws(() => useCase.execute({ title: "ab" }), ValidationError);
  assert.equal(repository.saveCalls, 0);
});

test("ChangeTaskStatus actualiza una tarea existente", () => {
  const repository = new FakeTaskRepository();
  const task = repository.save(Task.create({ title: "Tarea existente" }));
  const useCase = new ChangeTaskStatus(repository);

  const updated = useCase.execute(task.id, "finalizada");

  assert.equal(updated.status, "finalizada");
});

test("ChangeTaskStatus rechaza estados inválidos", () => {
  const repository = new FakeTaskRepository();
  const useCase = new ChangeTaskStatus(repository);

  assert.throws(() => useCase.execute(1, "archivada"), ValidationError);
});

test("ChangeTaskStatus devuelve NotFoundError si la tarea no existe", () => {
  const repository = new FakeTaskRepository();
  const useCase = new ChangeTaskStatus(repository);

  assert.throws(() => useCase.execute(99, "finalizada"), NotFoundError);
});

test("ListTasks devuelve las tareas del repositorio", () => {
  const repository = new FakeTaskRepository();
  repository.save(Task.create({ title: "Primera tarea" }));
  repository.save(Task.create({ title: "Segunda tarea" }));
  const useCase = new ListTasks(repository);

  const tasks = useCase.execute();

  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks.map(task => task.id), [1, 2]);
});

test("GetTaskStatuses devuelve una copia de los estados oficiales", () => {
  const useCase = new GetTaskStatuses();

  const statuses = useCase.execute();
  statuses.push("archivada");

  assert.deepEqual(useCase.execute(), ["pendiente", "en progreso", "finalizada"]);
});
