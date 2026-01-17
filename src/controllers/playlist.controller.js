import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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



export {
    createPlaylist,
    getUserPlaylists
};


