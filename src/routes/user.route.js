import express from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

export const routes = express.Router();

routes.route("/register").post(upload.single("avatar"), registerUser);
