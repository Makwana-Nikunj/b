import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Prevent duplicate subscriptions
subscriptionSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
);

// Optional: Prevent self-subscription at DB level
subscriptionSchema.pre("save", async function () {
    if (this.subscriber.toString() === this.channel.toString()) {
        throw new Error("User cannot subscribe to themselves");
    }
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
