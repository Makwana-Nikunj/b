import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { Comment } from "../models/comment.model.js"

import { Playlist } from "../models/playlist.model.js"
import { Subscription } from "../models/subscription.model.js"
import { PendingEmail } from "../models/pendingEmail.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, password, token } = req.body

    // Validate required fields
    if ([fullName, username, password, token].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    // Verify the token and get email from PendingEmail
    const pendingEmail = await PendingEmail.findOne({ token })
    if (!pendingEmail) {
        throw new ApiError(400, "Invalid or expired verification token. Please start registration again.")
    }

    const email = pendingEmail.email

    // Check if username already exists
    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    } catch (error) {
        throw new ApiError(500, error?.message || "Error uploading files to cloudinary")
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.secure_url,
        avatarPublicId: avatar.public_id,
        coverImage: coverImage?.secure_url || "",
        coverImagePublicId: coverImage?.public_id || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Delete the pending email entry after successful registration
    await PendingEmail.deleteOne({ _id: pendingEmail._id })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loginResponse = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { loginResponse, accessToken, refreshToken }, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) {
        throw new ApiError(400, "User ID is required to logout")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    user.refreshToken = null
    await user.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, null, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Password changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password ")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)

        if (!avatar) {
            throw new ApiError(500, "Something went wrong while uploading avatar")
        }

        // Delete old avatar from cloudinary
        if (req.user?.avatarPublicId) {
            await deleteFromCloudinary(req.user.avatarPublicId, "image");
        }
    } catch (error) {
        throw new ApiError(500, error?.message || "Error updating avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url,
                avatarPublicId: avatar.public_id
            }
        },
        { new: true }
    ).select("-password ")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!coverImage) {
            throw new ApiError(500, "Something went wrong while uploading cover image")
        }

        // Delete old cover image from cloudinary
        if (req.user?.coverImagePublicId) {
            await deleteFromCloudinary(req.user.coverImagePublicId, "image");
        }
    } catch (error) {
        throw new ApiError(500, error?.message || "Error updating cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.secure_url,
                coverImagePublicId: coverImage.public_id
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    let channel;
    try {
        channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]);
    } catch (error) {
        throw new ApiError(500, error?.message || "Error fetching channel profile")
    }

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    let user;
    try {
        user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]);
    } catch (error) {
        throw new ApiError(500, error?.message || "Error fetching watch history")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
})

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 1. Delete user's avatar from Cloudinary
    if (user.avatarPublicId) {
        try {
            await deleteFromCloudinary(user.avatarPublicId, "image");
        } catch (error) {
            console.error("Error deleting avatar:", error.message);
        }
    }

    // 2. Delete user's cover image from Cloudinary
    if (user.coverImagePublicId) {
        try {
            await deleteFromCloudinary(user.coverImagePublicId, "image");
        } catch (error) {
            console.error("Error deleting cover image:", error.message);
        }
    }

    // 3. Delete all user's videos (including files from Cloudinary)
    const userVideos = await Video.find({ owner: userId });
    for (const video of userVideos) {
        try {
            if (video.videoPublicId) {
                await deleteFromCloudinary(video.videoPublicId, "video");
            }
            if (video.thumbnailPublicId) {
                await deleteFromCloudinary(video.thumbnailPublicId, "image");
            }
        } catch (error) {
            console.error("Error deleting video files:", error.message);
        }

        // Delete likes on this video
        await Like.deleteMany({ video: video._id });
        // Delete comments on this video
        await Comment.deleteMany({ video: video._id });
    }
    await Video.deleteMany({ owner: userId });

    // 4. Delete all likes by this user
    await Like.deleteMany({ likedBy: userId });

    // 5. Delete all comments by this user
    await Comment.deleteMany({ owner: userId });

    // 6. Delete all playlists by this user
    await Playlist.deleteMany({ owner: userId });

    // 8. Delete all subscriptions (where user is subscriber or channel)
    await Subscription.deleteMany({
        $or: [{ subscriber: userId }, { channel: userId }]
    });

    // 9. Remove user from other users' watch history
    await User.updateMany(
        { watchHistory: userId },
        { $pull: { watchHistory: userId } }
    );

    // 10. Delete the user
    await User.findByIdAndDelete(userId);

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User account deleted successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    deleteUser
}