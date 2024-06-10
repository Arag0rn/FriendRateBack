import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { HttpError, sendEmail } from "../helpers/index.js";


dotenv.config();

const { JWT_SECRET, FRONTEND_BASE_URL } = process.env;



export const forgotPassword = async (req, res) => {
    const { email } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404, "User not found");
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    await User.findOneAndUpdate({ email }, { resetToken });

    const resetPasswordLink = `${FRONTEND_BASE_URL}/sign-in/restore/new-password/${resetToken}`;
    console.log(resetPasswordLink);

    const resetEmail = {
        to: email,
        subject: "Reset Password",
        html: `Click <a href="${resetPasswordLink}">here</a> to reset your password.`,
    };
    await sendEmail(resetEmail);

    res.status(200).json({ message: "Password reset email sent" });
};

export const resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    const decoded = jwt.verify(resetToken, JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
        throw HttpError(404, "User not found");
    }

    if (password !== confirmPassword) {
        throw HttpError(400, "Passwords do not match");
    }

    const newPasswordHash = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate({ email: decoded.email }, { password: newPasswordHash, resetToken: "" });

    res.status(200).json({ message: "Password reset successful" });
};

