import { Router } from "express";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
} from "../controllers/routine.controller.js";
import { authentication } from "../middlewares/auth.middeware.js";

export const routineRoutes = Router();

routineRoutes.route("/create-routine").post(authentication, createRoutine);
routineRoutes.route("/update-routine/:id").put(authentication,updateRoutine);
routineRoutes.route("/delete-routine/:id").delete(authentication,deleteRoutine);