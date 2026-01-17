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


export {
    createTweet
}   