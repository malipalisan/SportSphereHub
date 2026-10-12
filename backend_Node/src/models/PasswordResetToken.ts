import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PasswordResetTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },

    tokenHash: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    usedAt: {
        type: Date,
        default: null
    }
}, {
    versionKey: false
})

export default mongoose.model("PasswordResetToken", PasswordResetTokenSchema, "passwordResetTokens")
