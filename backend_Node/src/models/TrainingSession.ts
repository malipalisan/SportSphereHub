import mongoose from "mongoose";
import { ref } from "node:process";

const Schema = mongoose.Schema

const TrainingSessionSchema = new Schema({
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    trainerId: {
        type: Schema.Types.ObjectId,
        ref: "Trainer",
        required: true
    },

    facilityId: {
        type: Schema.Types.ObjectId,
        ref: "Facility",
        required: true
    },

    resourceId: {
        type: Schema.Types.ObjectId,
        ref: "Resource",
        required: true
    },

    sportId: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
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

    status: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    }

}, {
    versionKey: false
})


export default mongoose.model("TrainingSession", TrainingSessionSchema, "trainingSessions")