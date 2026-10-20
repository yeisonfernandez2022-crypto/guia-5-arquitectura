const { TASK_STATUSES } = require("../../domain/TaskStatus");

class GetTaskStatuses {
  execute() {
    return [...TASK_STATUSES];
  }
}

module.exports = { GetTaskStatuses };
