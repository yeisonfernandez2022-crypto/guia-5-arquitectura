import { createTaskApi } from "./api/taskApi.js";
import { TasksModel } from "./models/tasksModel.js";
import { TasksView } from "./views/tasksView.js";
import { TasksController } from "./controllers/tasksController.js";

const api = createTaskApi();
const model = new TasksModel();
const view = new TasksView();
const controller = new TasksController({ api, model, view });

controller.init();
