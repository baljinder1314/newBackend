import express from "express";
import {
  loggedInUser,
  loggedOut,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authentication } from "../middlewares/auth.middeware.js";

export const routes = express.Router();

routes.route("/register").post(upload.single("avatar"), registerUser);

routes.route("/logged-in").post(loggedInUser);
routes.route("/logged-out").post(authentication, loggedOut);
routes.route("/update-user-detail").patch(authentication, updateUser);
