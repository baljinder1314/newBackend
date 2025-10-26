import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

export const uploadOncloudinary = async (localfilePath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilePath);
    return uploadResult;
  } catch (error) {
    console.log("Error while uploading on cloudinary ", error);
  }
};

export const deleteFromCloudinary = async (oldPhotoPublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(oldPhotoPublicId);

    if (result.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
};
