const { Task } = require("./domain");

class TaskRepository {
  constructor() {
    this.tasks = [
      new Task({ id: 1, title: "Analizar el proyecto base", description: "Identificar responsabilidades", status: "en progreso" }),
      new Task({ id: 2, title: "Diseñar la arquitectura", description: "Proponer módulos", status: "pendiente" })
    ];
    this.nextId = 3;
  }

  findAll() {
    return [...this.tasks];
  }

  create(data) {
    const task = new Task({ ...data, id: this.nextId++ });
    this.tasks.push(task);
    return task;
  }

  findById(id) {
    return this.tasks.find(task => task.id === Number(id));
  }

  updateStatus(id, status) {
    const task = this.findById(id);
    if (!task) return null;
    task.status = status;
    return task;
  }
}

module.exports = { TaskRepository };
