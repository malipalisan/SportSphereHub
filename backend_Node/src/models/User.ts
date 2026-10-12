import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    role: {
        type: String,
        enum: ["athlete", "employee", "admin"],
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "blocked"]
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    passwordHash: {
        type: String,
        required: true
    },

    firstName: String,
    lastName: String,
    phone: String,
    avatarUrl: String,

    favoriteSportIds: [{
        type: Schema.Types.ObjectId,
        ref: "Sport"
    }],

    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: function(){
            return this.role === "employee"
        }
    },

    penalties: [{
        facilityId: {
            type: Schema.Types.ObjectId,
            ref: "Facility"
        },
        noShows: {
            type: Number,
            default: 0
        },
        blockedUntil: Date
    }]
}, {
    timestamps: true,
    versionKey: false
});


export default mongoose.model("User", UserSchema, "users");