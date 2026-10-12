import mongoose from "mongoose";

const Schema = mongoose.Schema

const OrderSchema = new Schema({
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    facilityId: {
        type: Schema.Types.ObjectId,
        ref: "Facility",
        required: true
    },

    items: [{
        equipmentId: {
            type: Schema.Types.ObjectId,
            ref: "Equipment",
            required: true
        },
        
        name: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true
        },

        unitPrice: {
            type: Number,
            required: true
        }
    }],

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true,
        deafult: "ordered"
    }

}, {
    timestamps: true,
    versionKey: false
})

export default mongoose.model("Order", OrderSchema, "orders")