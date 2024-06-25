import jwt from 'jsonwebtoken';
import { HttpError } from "../helpers/index.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import { ctrlWrapper } from "../decorators/index.js";

dotenv.config();
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
    const { authorization, refresh_token: refreshToken } = req.headers;

    if (!authorization && !refreshToken) {
        return next(HttpError(401, "Authorization header or refresh token not found"));
    }

    if (authorization) {
        const [bearer, token] = authorization.split(" ");
        if (bearer !== "Bearer" || !token) {
            return next(HttpError(401, "Invalid token format"));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                return next(HttpError(401, "User not found"));
            }
            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return next(HttpError(401, "Token expired"));
            } else {
                return next(HttpError(401, "Invalid token"));
            }
        }
    } else if (refreshToken) {
        try {
            const user = await User.findOne({ refreshToken });
            if (!user) {
                return next(HttpError(401, "Invalid refresh token"));
            }
            const newToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            await User.findByIdAndUpdate(user._id, { token: newToken });
            req.headers.authorization = `Bearer ${newToken}`;
            req.user = user;
            next();
        } catch (refreshError) {
            return next(HttpError(401, "Failed to refresh your session, please log in again."));
        }
    } else {
        return next(HttpError(401, "Invalid token or refresh token"));
    }
};

export default ctrlWrapper(authenticate);