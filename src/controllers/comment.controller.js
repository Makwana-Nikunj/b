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

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 500) {
        throw new ApiError(400, "Comment must be under 500 characters");
    }

    const comment = await Comment.findById(commentId).select("owner");

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this comment");
    }

    await Comment.updateOne(
        { _id: commentId },
        { $set: { content: trimmedContent } }
    );

    const updatedComment = await Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(true, updatedComment[0], "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId).select("owner");

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    await Comment.deleteOne({ _id: commentId });

    return res
        .status(200)
        .json(new ApiResponse(true, null, "Comment deleted successfully")
        );
});

export {
    addComment,
    updateComment,
    deleteComment

};
