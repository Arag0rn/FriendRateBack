import { uploadToCloudinary } from "../middlewares/uploadCloud.js";
import User from "../models/User.js";


export const updateAvatar = async (req, res) => {
    try {
        await uploadToCloudinary(req, res, async () => {
            const { _id } = req.user;

            const updatedUser = await User.findByIdAndUpdate(_id, { avatarURL: req.cloudinaryUrl }, { new: true });

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ avatarURL: updatedUser.avatarURL });
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};