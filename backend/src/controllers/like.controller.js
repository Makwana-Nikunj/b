import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
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

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const commentExists = await Comment.findById(commentId).select("_id");
    if (!commentExists) {
        throw new ApiError(404, "Comment not found");
    }
    const userId = req.user._id;

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(true, { isLiked: false }, "Comment unliked successfully")
        );
    }

    await Like.create({
        comment: commentId,
        likedBy: userId
    });

    return res.status(200).json(
        new ApiResponse(true, { isLiked: true }, "Comment liked successfully")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let result;
    try {
        result = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId),
                    video: { $exists: true }
                }
            },
            { $sort: { createdAt: -1 } },

            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                thumbnail: 1,
                                duration: 1,
                                views: 1,
                                owner: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            },

            { $unwind: "$video" },

            {
                $facet: {
                    data: [
                        { $skip: (pageNum - 1) * limitNum },
                        { $limit: limitNum }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);
    } catch (error) {
        throw new ApiError(500, error?.message || "Error fetching liked videos")
    }

    const videos = result[0].data.map(v => v.video);
    const totalCount = result[0].totalCount[0]?.count || 0;

    return res.status(200).json(
        new ApiResponse(
            true,
            {
                videos,
                pagination: {
                    totalVideos: totalCount,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalCount / limitNum)
                }
            },
            "Liked videos retrieved successfully"
        )
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    getLikedVideos
}