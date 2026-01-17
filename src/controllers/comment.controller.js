import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const ownerId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (content.length > 500) {
        throw new ApiError(400, "Comment must be under 500 characters");
    }

    const video = await Video.findById(videoId).select("_id");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: ownerId
    });

    const populatedComment = await comment.populate(
        "owner",
        "username avatar"
    );

    return res.status(201).json(
        new ApiResponse(true, populatedComment, "Comment added successfully")
    );
});

export { addComment };
