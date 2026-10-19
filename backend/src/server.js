const express = require("express");
const cors = require("cors");
const { TaskRepository } = require("./taskRepository");
const { TaskService } = require("./taskService");
const { createTaskController } = require("./taskController");
const { createTaskRoutes } = require("./taskRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const repository = new TaskRepository();
const service = new TaskService(repository);
const controller = createTaskController(service);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tasks", createTaskRoutes(controller));

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ error: error.message || "Error interno del servidor" });
});

app.listen(port, () => console.log(`API lista en http://localhost:${port}`));
