import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    const channelObjectId = new mongoose.Types.ObjectId(channelId);

    // Aggregate video-based stats
    const videoStats = await Video.aggregate([
        {
            $match: { owner: channelObjectId }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalVideos = videoStats[0]?.totalVideos || 0;
    const totalViews = videoStats[0]?.totalViews || 0;

    // Count subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    // Count likes on channel videos
    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $match: {
                "video.owner": channelObjectId
            }
        },
        {
            $count: "totalLikes"
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            true,
            {
                totalVideos,
                totalSubscribers,
                totalViews,
                totalLikes: totalLikes[0]?.totalLikes || 0
            },
            "Channel stats fetched successfully"
        )
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },

        {
            $sort: { createdAt: -1 }
        },

        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(true, videos, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats,
    getChannelVideos
}