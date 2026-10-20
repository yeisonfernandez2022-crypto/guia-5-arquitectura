class ListTasks {
  constructor(repository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.findAll();
  }
}

module.exports = { ListTasks };
