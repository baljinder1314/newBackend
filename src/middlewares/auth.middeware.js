import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const authentication = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "") ||
      req.body.accessToken;

    if (!token) {
      throw new ApiError(500, "Unautherized token");
    }

    const validToken = jwt.verify(
      token,
      process.env.SECRET_KEY_OF_ACCESS_TOKEN
    );

    const user = await User.findById(validToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(403, "Invalid user token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(500, "Error while user authentication ");
  }
};
