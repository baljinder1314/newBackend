import { Router } from "express";
import {
  createTask,
  getAllTasks,
  updateTaskById,
} from "../controllers/task.controller.js";
import { authentication } from "../middlewares/auth.middeware.js";

export const taskRoutes = Router();

taskRoutes.route("/create-task").post(authentication, createTask);
taskRoutes.route("/get-all-tasks").get(authentication, getAllTasks);
taskRoutes.route("/update-task-by-id/:id").put(authentication, updateTaskById);
