import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SportSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false
})

export default mongoose.model("Sport", SportSchema, "sports");