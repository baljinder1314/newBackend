import express from "express";
import { loggedInUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

export const routes = express.Router();

routes.route("/register").post(upload.single("avatar"), registerUser);

routes.route("/logged-in").post(loggedInUser);
