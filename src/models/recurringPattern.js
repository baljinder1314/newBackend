import mongoose, { Schema } from "mongoose";
const recurringPatternSchema = new Schema(
  {
    pattern: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "yearly", "custom"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const RecurringPattern = mongoose.model(
  "RecurringPattern",
  recurringPatternSchema
);
