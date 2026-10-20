const { Task } = require("../../domain/Task");

class CreateTask {
  constructor(repository) {
    this.repository = repository;
  }

  execute(input = {}) {
    const task = Task.create(input);
    return this.repository.save(task);
  }
}

module.exports = { CreateTask };
