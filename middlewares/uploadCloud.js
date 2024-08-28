import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from 'fs';
import { promisify } from 'util';

dotenv.config();

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: 'uploads/' });
const unlinkAsync = promisify(fs.unlink);

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

        const filePath = req.file.path;

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "avatars",
            allowed_formats: ["jpg", "png"],
            transformation: [
                { width: 320, height: 320, crop: "fill", gravity: "face" },
                { quality: "auto" }
            ]
        });

        await unlinkAsync(filePath);

        req.cloudinaryUrl = result.secure_url;
        next();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};