import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required");
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length > 100) {
        throw new ApiError(400, "Playlist name must be under 100 characters");
    }

    if (trimmedDescription.length > 500) {
        throw new ApiError(400, "Playlist description must be under 500 characters");
    }

    const playlist = await Playlist.create({
        name: trimmedName,
        description: trimmedDescription,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(true, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userExists = await User.findById(userId).select("_id");
    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const playlists = await Playlist.find({ owner: userId })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            true,
            playlists,
            "User playlists retrieved successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },

        // Join owner
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, email: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },

        // Join videos
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
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

        {
            $project: {
                name: 1,
                description: 1,
                owner: 1,
                videos: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    if (!playlist.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(true, playlist[0], "Playlist retrieved successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const playlist = await Playlist.findById(playlistId).select("owner videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 🔐 Ownership check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist");
    }

    const videoExists = await Video.findById(videoId).select("_id");
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } }, // prevents duplicates
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(true, updatedPlaylist, "Video added to playlist successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist
};


