import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    routine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Routine",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "cancelled"],
      default: "pending",
    },
    recurring_pattern_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringPattern",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const Reminder = mongoose.model("Reminder", reminderSchema);
