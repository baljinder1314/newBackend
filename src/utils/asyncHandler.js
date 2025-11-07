import ApiError from "./ApiError.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    throw new ApiError(500, error || error.message);
  }
};

export default asyncHandler;
