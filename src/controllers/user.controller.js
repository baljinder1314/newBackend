import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/uploadOnCloudinary.js";


export const registerUser = asyncHandler(async (req, res) => {
  // get username from frontend
  // check all fields are not empty
  // check user is already exist
  // check password
  // upload avatar on cloudinary
  // create user.
  // send response
  try {
    const { name, email, password, role, preferences } = req.body;
    const  avatar  = req.file.path;

    if ([name, email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "All Fields are required to Register");
    }

    if (!avatar) {
      throw new ApiError(400, "Avatar is required");
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Enter valid email ");
    }

    if (password.length < 6) {
      throw new ApiError(400, "Enter atleast 6 characters");
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new ApiError(400, "User is already exist");
    }

    if (role && !["user", "admin", "manager"].includes(role)) {
      throw new ApiError(400, "Enter role for application");
    }

    const uploadAvatar = await uploadOncloudinary(avatar);


    if (!uploadAvatar) {
      throw new ApiError(500, "Avatar is not uploaded in register function");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar: uploadAvatar?.url,
      role: role || "user",
      preferences: {
        theme: preferences?.theme || "light",
        language: preferences?.language || "en",
        notifications: {
          email:
            preferences?.notifications?.email !== undefined
              ? preferences.notifications.email
              : true,
          sms:
            preferences?.notifications?.sms !== undefined
              ? preferences.notifications.sms
              : false,
          push:
            preferences?.notifications?.push !== undefined
              ? preferences.notifications.push
              : true,
        },
      },
    }).select("-password")

    res
      .status(200)
      .json(new ApiResponse(200, user, "User created Successfuly", true));
  } catch (error) {
    console.log("Error while Register user:", error);
  }
});
