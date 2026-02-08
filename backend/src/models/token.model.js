import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        otp: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            index: { expires: 0 } // TTL index - auto-delete when expired
        }
    },
    {
        timestamps: true
    }
);

export const Token = mongoose.model("Token", tokenSchema);
