import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (req.user._id.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channel = await User.findById(channelId).select("_id");
    if (!channel) throw new ApiError(404, "Channel not found");

    const subscriberId = req.user._id;

    const existing = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existing) {
        await existing.deleteOne();
        return res.status(200).json(
            new ApiResponse(true, { isSubscribed: false }, "Unsubscribed successfully")
        );
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(true, { isSubscribed: true }, "Subscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriberExists = await User.findById(subscriberId).select("_id");
    if (!subscriberExists) {
        throw new ApiError(404, "Subscriber not found");
    }

    let subscribers;
    try {
        subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(subscriberId)
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriber",
                    pipeline: [
                        { $project: { username: 1, avatar: 1 } }
                    ]
                }
            },

            { $unwind: "$subscriber" },

            { $sort: { createdAt: -1 } },

            {
                $project: {
                    subscriber: 1,
                    _id: 0
                }
            }
        ]);
    } catch (error) {
        throw new ApiError(500, error?.message || "Error fetching subscribers")
    }

    const formatted = subscribers.map(s => s.subscriber);

    return res.status(200).json(
        new ApiResponse(true, formatted, "Subscribers fetched successfully")
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscriberExists = await User.findById(channelId).select("_id");
    if (!subscriberExists) {
        throw new ApiError(404, "User not found");
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let subscriptions;
    try {
        subscriptions = await Subscription.aggregate([
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(channelId)
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channel",
                    pipeline: [
                        { $project: { username: 1, fullName: 1, avatar: 1 } }
                    ]
                }
            },

            { $unwind: "$channel" },

            // Lookup subscriber count for each channel
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "channel._id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },

            // Add subscriberCount to channel object
            {
                $addFields: {
                    "channel.subscriberCount": { $size: "$subscribers" }
                }
            },

            { $sort: { createdAt: -1 } },

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
    } catch (error) {
        throw new ApiError(500, error?.message || "Error fetching subscribed channels")
    }

    const channels = subscriptions[0].data.map(s => s.channel);
    const totalCount = subscriptions[0].totalCount[0]?.count || 0;

    return res.status(200).json(
        new ApiResponse(true, {
            channels,
            pagination: {
                totalChannels: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        }, "Subscribed channels fetched successfully")
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}