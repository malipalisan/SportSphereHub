import mongoose from "mongoose";

const Schema = mongoose.Schema

const ReservationSchema = new Schema({
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

    attendanceMarkedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true,
    versionKey: false
})


export default mongoose.model("Reservation", ReservationSchema, "reservations")
