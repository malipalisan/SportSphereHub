import mongoose from "mongoose";

const Schema = mongoose.Schema

const FacilitySchema = new Schema({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },

    description: {
        type: String,
        required: true
    },

    images: [{
        type: String
    }],

    sportIds: [{
        type: Schema.Types.ObjectId,
        ref: "Sport"
    }],

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    workingHours: {
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        }
    },

    defaultHourlyPrice: {
        type: Number,
        required: true
    },

    allowedNoShows: {
        type: Number,
        default: 2
    },

    likesCount: {
        type: Number,
        default: 0
    },
    
    dislikesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
})

export default mongoose.model("Facility", FacilitySchema, "facilities")