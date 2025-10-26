import { ApiResponse } from "./ApiResponse.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(500).json(new ApiResponse(500, error));
  }
};

export default asyncHandler;
