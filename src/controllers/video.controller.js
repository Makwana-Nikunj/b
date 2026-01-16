import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile, thumbnailImage } = req.files || {};

    if ([title, description].some(f => !f?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    if (title.length > 100) {
        throw new ApiError(400, "Title must be under 100 characters");
    }

    if (description.length > 500) {
        throw new ApiError(400, "Description must be under 500 characters");
    }

    if (!videoFile?.length) throw new ApiError(400, "Video file is required");

    if (!thumbnailImage?.length) throw new ApiError(400, "Thumbnail image is required");

    const videoPath = videoFile[0].path;
    const thumbnailPath = thumbnailImage[0].path;

    let videoUploadResponse, thumbnailUploadResponse;

    try {
        videoUploadResponse = await uploadOnCloudinary(videoPath, "video", "videos");

        if (!videoUploadResponse?.secure_url) {
            throw new ApiError(500, "Video upload failed");
        }

        thumbnailUploadResponse = await uploadOnCloudinary(thumbnailPath, "image", "thumbnails");

        if (!thumbnailUploadResponse?.secure_url) {
            await deleteFromCloudinary(videoUploadResponse.public_id, "video");
            throw new ApiError(500, "Thumbnail upload failed");
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Cloudinary upload error");
    }

    const video = await Video.create({
        videoFile: videoUploadResponse.secure_url,
        videoPublicId: videoUploadResponse.public_id,
        thumbnail: thumbnailUploadResponse.secure_url,
        thumbnailPublicId: thumbnailUploadResponse.public_id,
        title,
        description,
        duration: videoUploadResponse.duration,
        owner: req.user._id
    });

    // Remove sensitive fields before sending response
    const videoResponse = video.toObject();
    delete videoResponse.videoPublicId;
    delete videoResponse.thumbnailPublicId;

    console.log("Video published successfully:", videoResponse);



    return res
        .status(201)
        .json(new ApiResponse(true, videoResponse, "Video published successfully"));
});


export { publishAVideo }
