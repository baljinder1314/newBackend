import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/uploadOnCloudinary.js";
import bcrypt from "bcrypt";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const createdAccessToken = await user.accessToken();
    const createdRefreshToken = await user.generateRefreshToken();

    user.refreshToken = createdRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { createdAccessToken, createdRefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Something went wrong while generating refresh token and access token: ${error}`
    );
  }
};

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
    const avatar = req.file.path;

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
    });

    res
      .status(201) // Using 201 for resource creation
      .json(new ApiResponse(201, user, "User created successfully", true));
  } catch (error) {
    console.error("Error while registering user:", error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal server error",
          false
        )
      );
  }
});

const options = {
  httpOnly: true, // ✅ prevents access by JS in browser
  secure: false,
};
export const loggedInUser = asyncHandler(async (req, res) => {
  //Get data from user;
  //check all fields are not empty;
  //check user either exist or not;
  // check password is correct;
  //create access and refresh tokens;
  //remove password from the user data;
  // send response;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(403, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      throw new ApiError(400, "Invalid email or password");
    }

    const correctPassword = await user.isPasswordCorrect(password);

    if (!correctPassword) {
      throw new ApiError(405, "Enter valid password");
    }

    const { createdAccessToken, createdRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res
      .status(200)
      .cookie("accessToken", createdAccessToken, options)
      .cookie("refreshToken", createdRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser, createdAccessToken, createdRefreshToken },
          "Successfuly Logged In"
        )
      );
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal server error",
          false
        )
      );
  }
});

export const loggedOut = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged Out Successfuly"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(403, "Name is required to update name");
  }

  const user = req.user?._id;

  const updatedUser = await User.findByIdAndUpdate(
    user,
    {
      $set: {
        name,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Successfuly Update User"));
});

export const changePassword = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    console.log(user);
    const { newPassword, oldPassword } = req.body;

    const varifyOldPassword = await user.isPasswordCorrect(oldPassword);

    if (!varifyOldPassword) {
      throw new ApiError(405, "Enter valid Password");
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, { }, "Password Changed"));
  } catch (error) {
    console.log(`Error while change Password ${error}`);
  }
});
