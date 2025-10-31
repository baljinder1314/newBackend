import { Routine } from "../models/routine.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createRoutine = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      hours_start, // New: start hour (0-23)
      hours_end, // New: end hour (0-23)
      priority,
      status,
      recurring_pattern_id,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      (!start_time && hours_start === undefined) ||
      (!end_time && hours_end === undefined)
    ) {
      throw new ApiError(
        400,
        "Title and either start/end times or hours are required"
      );
    }

    // Validate hours if provided
    if (
      hours_start !== undefined &&
      (hours_start < 0 || hours_start > 23 || !Number.isInteger(hours_start))
    ) {
      throw new ApiError(400, "Start hour must be between 0 and 23");
    }
    if (
      hours_end !== undefined &&
      (hours_end < 0 || hours_end > 23 || !Number.isInteger(hours_end))
    ) {
      throw new ApiError(400, "End hour must be between 0 and 23");
    }

    // Validation user Exists.
    const user_id = req.user?._id;
    if (!user_id) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Set up dates with hours
    let startDate, endDate;

    if (hours_start !== undefined && hours_end !== undefined) {
      // Using hours
      startDate = new Date();
      startDate.setHours(hours_start, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(hours_end, 0, 0, 0);

      // If end hour is less than start hour, move end to next day
      if (hours_end <= hours_start) {
        endDate.setDate(endDate.getDate() + 1);
      }
    } else {
      // Using full date-times
      startDate = new Date(start_time);
      endDate = new Date(end_time);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(
          400,
          "Invalid date format for start_time or end_time"
        );
      }
    }

    // Final validation for time sequence
    if (endDate <= startDate) {
      throw new ApiError(400, "End time must be after start time");
    }

    // Validate priority if provided
    if (priority && !["low", "medium", "high"].includes(priority)) {
      throw new ApiError(400, "Priority must be either low, medium, or high");
    }

    const routine = await Routine.create({
      user_id,
      title: title.trim(),
      description: description?.trim(),
      start_time: startDate,
      end_time: endDate,
      priority: priority || "medium",
      status: status || "pending",
      recurring_pattern_id,
    });

    if (!routine) {
      throw new ApiError(500, "Failed to create routine");
    }

    res
      .status(201) // Using 201 for resource creation
      .json(new ApiResponse(201, routine, "Routine created successfully"));
  } catch (error) {
    console.error("Error creating routine:", error);

    // Pass through the specific error if it's our ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      throw new ApiError(400, error.message);
    }

    // Generic error
    throw new ApiError(500, `Error while creating routine: ${error.message}`);
  }
});

export const updateRoutine = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      start_time,
      end_time,
      priority,
      status,
      recurring_pattern_id,
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "Invlid user");
    }

    const existingRoutine = await Routine.findByIdAndUpdate(req.params.id);
    if (!existingRoutine) {
      throw new ApiError(400, "Routine not found");
    }

    // Build update object with operators
    const updateOperations = {};

    if (title !== undefined) updateOperations.title = title;
    if (description !== undefined) updateOperations.description = description;
    if (priority !== undefined) updateOperations.priority = priority;
    if (status !== undefined) updateOperations.status = status;
    if (recurring_pattern_id !== undefined)
      updateOperations.recurring_pattern_id = recurring_pattern_id;

    // Handle date validations
    const finalStartTime = start_time
      ? new Date(start_time)
      : existingRoutine.start_time;
    const finalEndTime = end_time
      ? new Date(end_time)
      : existingRoutine.end_time;

    if (finalEndTime <= finalStartTime) {
      throw new ApiError(400, "End time must be after start time");
    }

    if (start_time !== undefined) updateOperations.start_time = finalStartTime;
    if (end_time !== undefined) updateOperations.end_time = finalEndTime;

    const updateRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateOperations,
        $currentDate: { updated_at: true },
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).populate("user_id", "name email");

    res
      .status(200)
      .json(new ApiResponse(200, updateRoutine, "Routine Update Successfuly"));
  } catch (error) {
    throw new ApiError(200, error);
  }
});

export const deleteRoutine = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(400, "Invalid user while deleting routine");
    }
    const deleteRoutine = await Routine.findByIdAndDelete(req.params.id);
    if (!deleteRoutine) {
      throw new ApiError(400, "Routine note found while deleting");
    }
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Routine Delete successfuly"));
  } catch (error) {
    throw new ApiError(400, error);
  }
});
