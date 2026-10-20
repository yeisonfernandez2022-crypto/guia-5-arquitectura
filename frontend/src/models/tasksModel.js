export class TasksModel {
  constructor() {
    this.tasks = [];
    this.statuses = [];
  }

  setTasks(tasks) {
    this.tasks = Array.isArray(tasks) ? tasks.map(task => ({ ...task })) : [];
  }

  setStatuses(statuses) {
    this.statuses = Array.isArray(statuses) ? [...statuses] : [];
  }

  getTasks() {
    return this.tasks.map(task => ({ ...task }));
  }

  getStatuses() {
    return [...this.statuses];
  }
}
