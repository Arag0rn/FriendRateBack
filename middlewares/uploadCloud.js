import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { ALLOWED_FORMATS, UPLOAD_FILE_LIMIT } from "../utils/constant.js";
import dotenv from "dotenv";

dotenv.config();

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: UPLOAD_FILE_LIMIT }
});
export const handleUpload = (req, res, next) => {
    upload.single("avatarURL")(req, res, (err) => {
        if (err) {

            return res.status(400).json({ error: err.message });
        }

        next();
    });
};

export const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File not provided" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "avatars",
            allowed_formats: ALLOWED_FORMATS,
        });

        req.cloudinaryUrl = result.secure_url;
        next();
    } catch (error) {
        if (error.http_code === 400 && error.message.includes("file size")) {
            return res.status(400).json({ error: "File size limit exceeded" });
        }
        return res.status(400).json({ error: error.message });
    }
};