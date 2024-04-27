import { Schema, model } from "mongoose";
import { handleSaveError } from "./hooks.js";


const userUnregSchema = new Schema(
    {

        username: {
            type: String,

        },

        status: {
            type: String,
            enum: ["unregister"],
        },

        expirationDate: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24,
        },

    },
    { versionKey: false, timestamps: true }
);

userUnregSchema.post("save", handleSaveError);



const UserUnreg = model("user-unreg", userUnregSchema);

export default UserUnreg;