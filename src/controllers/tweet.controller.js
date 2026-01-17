import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 280) {
        throw new ApiError(400, "Tweet must be under 280 characters");
    }

    const tweet = await Tweet.create({
        content: trimmedContent,
        owner: userId
    });

    return res
        .status(201)
        .json(new ApiResponse(true, tweet, "Tweet created successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > 280) {
        throw new ApiError(400, "Tweet must be under 280 characters");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = trimmedContent;
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(true, tweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId).select("owner");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    return res.status(200).json(
        new ApiResponse(true, null, "Tweet deleted successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userExists = await User.findById(userId).select("_id");
    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const result = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },

        { $sort: { createdAt: -1 } },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, name: 1, avatar: 1 } }
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
        },

        {
            $facet: {
                data: [
                    { $skip: (pageNum - 1) * limitNum },
                    { $limit: limitNum }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const tweets = result[0].data;
    const totalTweets = result[0].totalCount[0]?.count || 0;

    return res.status(200).json(
        new ApiResponse(
            true,
            {
                tweets,
                pagination: {
                    totalTweets,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalTweets / limitNum)
                }
            },
            "User tweets retrieved successfully"
        )
    );
});



export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}   