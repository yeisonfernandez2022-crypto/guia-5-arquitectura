const express = require("express");
const cors = require("cors");
const { createHealthRoutes } = require("./interfaces/http/healthRoutes");
const { createTaskRoutes } = require("./interfaces/http/taskRoutes");
const { notFoundHandler, errorHandler } = require("./interfaces/http/errorHandler");

function createApp({ controller, corsOrigin = "*", staticDir } = {}) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.use("/api/health", createHealthRoutes());
  app.use("/api/tasks", createTaskRoutes(controller));

  if (staticDir) {
    app.use(express.static(staticDir));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
