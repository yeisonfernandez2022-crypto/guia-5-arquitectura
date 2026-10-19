const VALID_STATUSES = ["pendiente", "en progreso", "finalizada"];

class TaskService {
  constructor(repository) {
    this.repository = repository;
  }

  listTasks() {
    return this.repository.findAll();
  }

  createTask({ title, description = "" }) {
    if (typeof title !== "string" || title.trim().length < 3) {
      const error = new Error("El título debe tener al menos 3 caracteres.");
      error.statusCode = 400;
      throw error;
    }
    return this.repository.create({ title: title.trim(), description: String(description).trim(), status: "pendiente" });
  }

  changeStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      const error = new Error(`Estado inválido. Use: ${VALID_STATUSES.join(", ")}.`);
      error.statusCode = 400;
      throw error;
    }
    const updated = this.repository.updateStatus(id, status);
    if (!updated) {
      const error = new Error("No existe una tarea con ese identificador.");
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }
}

module.exports = { TaskService };
