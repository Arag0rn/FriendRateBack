import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import { Readable } from 'stream';

dotenv.config();

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

export const handleUpload = upload.single("avatarURL");

export const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File not provided" });
        }


        const stream = new Readable();
        stream.push(req.file.buffer);
        stream.push(null); 


        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "avatars",
            allowed_formats: ["jpg", "png"],
            transformation: [
                { width: 320, height: 320, crop: "fill", gravity: "face" },
                { quality: "auto" }
            ]
        }, (error, result) => {
            if (error) {
                return res.status(400).json({ error: error.message });
            }

            req.cloudinaryUrl = result.secure_url;
            next();
        });

        stream.pipe(uploadStream);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};