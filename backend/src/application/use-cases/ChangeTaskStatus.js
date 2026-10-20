const { NotFoundError } = require("../../domain/errors");
const { assertValidStatus } = require("../../domain/TaskStatus");

class ChangeTaskStatus {
  constructor(repository) {
    this.repository = repository;
  }

  execute(id, status) {
    assertValidStatus(status);

    const task = this.repository.findById(id);
    if (!task) {
      throw new NotFoundError("No existe una tarea con ese identificador.");
    }

    task.changeStatus(status);
    return this.repository.save(task);
  }
}

module.exports = { ChangeTaskStatus };
