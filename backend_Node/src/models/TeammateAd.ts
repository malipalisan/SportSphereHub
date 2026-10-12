import mongoose from "mongoose";

const Schema = mongoose.Schema

const TeammateAdSchema = new Schema({
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sportId: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        required: true
    },

    city: {
        type: String,
        required: true
    },

    startAt: {
        type: Date,
        required: true
    },

    endAt: {
        type: Date,
        required: true
    },

    missingPlayers: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    },

    joinRequests: [{
        athleteId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    versionKey: false
})

export default mongoose.model("TeammateAd", TeammateAdSchema, "teammateAds")
