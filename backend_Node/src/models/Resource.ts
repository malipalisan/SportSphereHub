import mongoose from "mongoose";

const Schema = mongoose.Schema

const ResourceSchema = new Schema({
    facilityId: {
        type: Schema.Types.ObjectId,
        ref: "Facility",
        required: true
    },
    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["outdoor", "indoor", "arena"],
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    sportIds: [{
        type: Schema.Types.ObjectId,
        ref: "Sport"
    }],

    equipmentDescription: {
        type: String,
        default: ""
    },

    active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false
})

export default mongoose.model("Resource", ResourceSchema, "resources")