import mongoose from "mongoose";

const Schema = mongoose.Schema

const FacilityReviewSchema = new Schema({
    facilityId: {
        type: Schema.Types.ObjectId,
        ref: "Facility",
        required: true
    },

    athleteId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reaction: {
        type: String,
        enum: ["like", "dislike"],
        required: true
    },

    comment: {
        type: String,
        required: true,
        maxlength: 500
    }
}, {
    timestamps: true,
    versionKey: false
})

export default mongoose.model("FacilityReview", FacilityReviewSchema, "facilityReviews")
