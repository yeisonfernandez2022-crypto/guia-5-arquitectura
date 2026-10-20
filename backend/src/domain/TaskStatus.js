const { ValidationError } = require("./errors");

const TASK_STATUSES = Object.freeze(["pendiente", "en progreso", "finalizada"]);
const DEFAULT_STATUS = "pendiente";

function isValidStatus(status) {
  return TASK_STATUSES.includes(status);
}

function assertValidStatus(status) {
  if (!isValidStatus(status)) {
    throw new ValidationError(`Estado inválido. Use: ${TASK_STATUSES.join(", ")}.`);
  }
}

module.exports = { TASK_STATUSES, DEFAULT_STATUS, isValidStatus, assertValidStatus };
