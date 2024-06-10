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


    },
    { versionKey: false, timestamps: true }
);

userUnregSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

userUnregSchema.post("save", handleSaveError);



const UserUnreg = model("user-unreg", userUnregSchema);

export default UserUnreg;