const { ValidationError, NotFoundError } = require("../../domain/errors");

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." });
}

function errorHandler(error, req, res, next) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }

  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor." });
}

module.exports = { notFoundHandler, errorHandler };
