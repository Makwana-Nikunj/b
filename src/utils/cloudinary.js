// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



export const uploadOnCloudinary = async (
    localFilePath,
    resourceType = "auto",
    folder = ""
) => {
    try {
        if (!localFilePath) return null;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            folder: folder || undefined
        });

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return response;
    } catch (error) {
        throw error;
    }
};
