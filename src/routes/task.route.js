import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";
import { authentication } from "../middlewares/auth.middeware.js";

export const taskRoutes = Router();

taskRoutes.route("/create-task").post(authentication,createTask);
