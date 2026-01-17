import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoExists = await Video.findById(videoId).select("_id");
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(true, { isLiked: false }, "Video unliked successfully")
        );
    }

    await Like.create({
        video: videoId,
        likedBy: userId
    });

    return res.status(200).json(
        new ApiResponse(true, { isLiked: true }, "Video liked successfully")
    );
});




export {
    toggleVideoLike
}