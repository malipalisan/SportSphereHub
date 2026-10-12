import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TrainerSchema = new Schema(
  {
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
      required: true
    },

    firstName: {
      type: String,
      required: true
    },

    lastName: {
      type: String,
      required: true
    },

    specialization: {
      type: String,
      required: true
    },

    sportIds: [{
      type: Schema.Types.ObjectId,
      ref: "Sport"
    }],

    averageRating: {
      type: Number,
      default: 0
    },

    hourlyPrice: {
      type: Number,
      required: true
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false
  }
);

export default mongoose.model("Trainer", TrainerSchema, "trainers");