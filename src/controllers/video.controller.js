import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"
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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video
        .findById(videoId)
        .populate("owner", "username avatar fullName")
        .select("-videoPublicId -thumbnailPublicId");


    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increment view count
    video.views = (video.views || 0) + 1;
    await video.save({ validateBeforeSave: false });

    // Get like count and check if user has liked
    const likeCount = await Like.countDocuments({ video: videoId });
    let isLiked = false;
    if (req.user?._id) {
        const userLike = await Like.findOne({ video: videoId, likedBy: req.user._id });
        isLiked = !!userLike;
    }

    // Add to watch history if user is authenticated
    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: { watchHistory: videoId }, // Remove if already exists
            }
        );
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    watchHistory: {
                        $each: [videoId],
                        $position: 0 // Add to beginning
                    }
                }
            }
        );
    }

    // Convert to object and add like info
    const videoData = video.toObject();
    videoData.likesCount = likeCount;
    videoData.isLiked = isLiked;

    return res
        .status(200)
        .json(new ApiResponse(true, videoData, "Video fetched successfully"));

});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailFile = req.file;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingVideo = await Video.findById(videoId);

    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    if (existingVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if ([title, description].some(f => f?.trim() === "")) {
        throw new ApiError(400, "Fields cannot be empty strings");
    }

    if (title && title.length > 100) {
        throw new ApiError(400, "Title must be under 100 characters");
    }

    if (description && description.length > 500) {
        throw new ApiError(400, "Description must be under 500 characters");
    }

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    if (thumbnailFile) {
        try {
            const newThumbnail = await uploadOnCloudinary(thumbnailFile.path, "image", "thumbnails");

            if (!newThumbnail?.secure_url) {
                throw new ApiError(500, "Thumbnail upload failed");
            }

            if (existingVideo.thumbnailPublicId) {
                await deleteFromCloudinary(existingVideo.thumbnailPublicId, "image");
            }

            updateFields.thumbnail = newThumbnail.secure_url;
            updateFields.thumbnailPublicId = newThumbnail.public_id;
        } catch (error) {
            throw new ApiError(500, error.message || "Thumbnail upload error");
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    ).select("-videoPublicId -thumbnailPublicId");

    return res
        .status(200)
        .json(new ApiResponse(true, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    try {
        if (video.videoPublicId) {
            await deleteFromCloudinary(video.videoPublicId, "video");
        }

        if (video.thumbnailPublicId) {
            await deleteFromCloudinary(video.thumbnailPublicId, "image");
        }
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error.message);
        // Continue with database deletion even if Cloudinary fails
    }

    await video.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(true, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    try {
        video.isPublished = !video.isPublished;
        await video.save();
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to toggle publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(true, video.isPublished, "Publish status toggled successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (pageNum < 1 || limitNum < 1) {
        throw new ApiError(400, "Page and limit must be positive numbers");
    }

    const matchStage = { isPublished: true };

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const sortStage = {};
    if (sortBy) {
        sortStage[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
        sortStage.createdAt = -1;
    }

    let results;
    try {
        results = await Video.aggregate([
            { $match: matchStage },

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
                    videoPublicId: 0,
                    thumbnailPublicId: 0,
                    __v: 0
                }
            },

            { $sort: sortStage },

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
        throw new ApiError(500, error.message || "Failed to fetch videos");
    }

    const videos = results[0].data || [];
    const totalCount = results[0].totalCount[0]?.count || 0;

    if (!videos.length) {
        return res
            .status(200)
            .json(new ApiResponse(true, [], "No videos found"));
    }

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
            "Videos fetched successfully"
        )
    );
});


export { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos };