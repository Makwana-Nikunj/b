import mongoose, { Schema } from "mongoose";

const pendingEmailSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            index: { expires: 0 } // TTL index - auto-delete when expired
        }
    },
    {
        timestamps: true
    }
);

export const PendingEmail = mongoose.model("PendingEmail", pendingEmailSchema);
