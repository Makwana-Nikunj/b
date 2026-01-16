import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/temp");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const videoExt = [".mp4", ".mov", ".mkv", ".webm"];
    const imageExt = [".jpg", ".jpeg", ".png", ".webp"];

    // Check video file
    if (file.fieldname === "videoFile") {
        if (!videoExt.includes(ext)) {
            return cb(new Error("Invalid video file format"), false);
        }
        return cb(null, true);
    }

    // For any other field, check if it's a valid image
    if (imageExt.includes(ext)) {
        return cb(null, true);
    }

    // Reject if not a valid image or video
    return cb(new Error(`Invalid file format for field: ${file.fieldname}`), false);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});
