import mongoose from "mongoose";

const Schema = mongoose.Schema

const PromotionsSchema = new Schema({
    facilityId: {
        type: Schema.Types.ObjectId,
        ref: "Facility",
        required: true
    },
    sportId: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    validFrom: {
        type: Date,
        required: true
    },
    validTo: {
        type: Date,
        required: true
    },
    discountType: {
        type: String,
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
}, {
    versionKey: false
})


export default mongoose.model("Promotions", PromotionsSchema, "promotions")