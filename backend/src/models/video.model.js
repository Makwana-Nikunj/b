import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        videoPublicId: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        thumbnailPublicId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }

    },
    {
        timestamps: true
    }
)

/**
 * Database Indexes for Query Optimization
 * These significantly improve query performance
 */
// Index for fetching user's videos sorted by date
videoSchema.index({ owner: 1, createdAt: -1 });

// Index for trending/popular videos
videoSchema.index({ views: -1 });

// Index for published videos sorted by date
videoSchema.index({ isPublished: 1, createdAt: -1 });

// Compound index for owner's videos by views
videoSchema.index({ owner: 1, views: -1 });

// Text index for search functionality
videoSchema.index({ title: 'text', description: 'text' });

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)