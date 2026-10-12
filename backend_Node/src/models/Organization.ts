import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  headquartersAddress: {
    type: String,
    required: true
  },

  registrationNumber: {
    type: String,
    required: true,
    match: /^[0-9]{8}$/
  },

  taxId: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{8}$/
  },

  employeeIds: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]

}, {
    versionKey: false
})

export default mongoose.model("Organization", OrganizationSchema, "organizations")