import mongoose from "mongoose";

const routineSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
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
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    recurring_pattern_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringPattern",
    },
  },
  { timestamps: true }
);

// Virtual for duration in minutes
routineSchema.virtual("duration_minutes").get(function () {
  return Math.round((this.end_time - this.start_time) / (1000 * 60));
});

// Instance method to check if routine is active
routineSchema.methods.isActive = function () {
  const now = new Date();
  return (
    now >= this.start_time &&
    now <= this.end_time &&
    this.status === "in-progress"
  );
};

// Static method to find routines by status
routineSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate("user_id", "name email");
};

export const Routine = mongoose.model("Routine", routineSchema);
