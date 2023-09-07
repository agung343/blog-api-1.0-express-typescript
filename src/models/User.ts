import mongoose, { Schema } from "mongoose";

const userSchema  = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }]
})

export const User = mongoose.model("User", userSchema)