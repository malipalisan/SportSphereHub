import mongoose from "mongoose";

const Schema = mongoose.Schema

const EquipmentSchema = new Schema(
  {
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
    name: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
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

export default mongoose.model("Equipment", EquipmentSchema, "equipment");