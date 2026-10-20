const { toTaskResponse } = require("./taskPresenter");

function createTaskController(useCases) {
  return {
    list(req, res, next) {
      try {
        const tasks = useCases.listTasks.execute();
        res.json(tasks.map(toTaskResponse));
      } catch (error) {
        next(error);
      }
    },

    create(req, res, next) {
      try {
        const task = useCases.createTask.execute(req.body || {});
        res.status(201).json(toTaskResponse(task));
      } catch (error) {
        next(error);
      }
    },

    updateStatus(req, res, next) {
      try {
        const task = useCases.changeTaskStatus.execute(req.params.id, req.body?.status);
        res.json(toTaskResponse(task));
      } catch (error) {
        next(error);
      }
    },

    statuses(req, res, next) {
      try {
        res.json({ statuses: useCases.getTaskStatuses.execute() });
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = { createTaskController };
