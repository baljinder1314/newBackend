import { Task } from "../models/task.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { convertTimeToDate } from "../utils/timeConverter.js";

export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, start_time, end_time, priority, status } =
      req.body;

    // auth check
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "Authentication required to create task");
    }

    // required fields: title, start_time, end_time
    if (!title || !start_time || !end_time) {
      throw new ApiError(400, "title, start_time and end_time are required");
    }

    // convert times (convertTimeToDate is defensive but validate here)
    let startDate, endDate;
    try {
      startDate = convertTimeToDate(start_time);
      endDate = convertTimeToDate(end_time);
    } catch (err) {
      throw new ApiError(400, `Invalid time format: ${err.message}`);
    }

    if (endDate <= startDate) {
      throw new ApiError(400, "end_time must be after start_time");
    }

    const createdTask = await Task.create({
      user_id: userId,
      title: title.trim(),
      description: description?.trim(),
      start_time: startDate,
      end_time: endDate,
      priority: priority || "medium",
      status: status || "pending",
    });

    res
      .status(201)
      .json(new ApiResponse(201, createdTask, "Task Created Successfully"));
  } catch (error) {
    console.error("Error while creating task:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Error while creating task: ${error.message}`);
  }
});

export const getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find({ user_id: req.user?._id })
      .populate("routine_id")
      .populate("recurring_pattern_id")
      .sort({ created_at: -1 });

    res
      .status(200)
      .json(new ApiResponse(200, tasks, "Got all tasks successfuly"));
  } catch (error) {
    throw new ApiError(500, "Error fetching tasks", error);
  }
});

export const updateTaskById = asyncHandler(async (req, res) => {
  try {
    // ✅ Allowed fields for update
    const allowedUpdates = [
      "title",
      "description",
      "start_time",
      "end_time",
      "priority",
      "status",
      "routine_id",
      "recurring_pattern_id",
    ];

    // ✅ Filter only allowed fields from req.body
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    // ✅ Convert time strings if provided
    if (updates.start_time) {
      updates.start_time = convertTimeToDate(updates.start_time);
    }
    if (updates.end_time) {
      updates.end_time = convertTimeToDate(updates.end_time);
    }

    updates.updated_at = Date.now();

    const task = await Task.findByIdAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user?._id,
      },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) {
      throw new ApiError(404, "task not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, task, "Task updated successfully"));
  } catch (error) {
    res.status(500).json({
      message: "Error updating task",
      error: error.message, // ✅ FIXED
    });
  }
});
