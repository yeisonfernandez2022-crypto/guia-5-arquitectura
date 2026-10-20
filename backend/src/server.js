const { loadConfig } = require("./config");
const { createApp } = require("./app");
const { InMemoryTaskRepository } = require("./infrastructure/InMemoryTaskRepository");
const seedTasks = require("./infrastructure/seed");
const { ListTasks } = require("./application/use-cases/ListTasks");
const { CreateTask } = require("./application/use-cases/CreateTask");
const { ChangeTaskStatus } = require("./application/use-cases/ChangeTaskStatus");
const { GetTaskStatuses } = require("./application/use-cases/GetTaskStatuses");
const { createTaskController } = require("./interfaces/http/taskController");

function bootstrap(env = process.env) {
  const config = loadConfig(env);
  const repository = new InMemoryTaskRepository(seedTasks);
  const controller = createTaskController({
    listTasks: new ListTasks(repository),
    createTask: new CreateTask(repository),
    changeTaskStatus: new ChangeTaskStatus(repository),
    getTaskStatuses: new GetTaskStatuses()
  });
  const app = createApp({
    controller,
    corsOrigin: config.corsOrigin,
    staticDir: config.staticDir
  });

  return { app, config };
}

if (require.main === module) {
  const { app, config } = bootstrap();
  app.listen(config.port, () => {
    console.log(`API y frontend disponibles en http://localhost:${config.port}`);
  });
}

module.exports = { bootstrap };
