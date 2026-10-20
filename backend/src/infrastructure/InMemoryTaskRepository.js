const { Task } = require("../domain/Task");
const { TaskRepository } = require("../application/ports/TaskRepository");

class InMemoryTaskRepository extends TaskRepository {
  constructor(seed = []) {
    super();
    this.tasks = new Map();
    this.nextId = 1;

    for (const data of seed) {
      const task = Task.fromPersistence(data);
      this.tasks.set(task.id, task);
      this.nextId = Math.max(this.nextId, task.id + 1);
    }
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
    return stored.clone();
  }
}

module.exports = { InMemoryTaskRepository };
