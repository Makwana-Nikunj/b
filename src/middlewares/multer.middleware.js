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

    if (file.fieldname === "videoFile" && !videoExt.includes(ext)) {
        return cb(new Error("Invalid video file format"), false);
    }

    if (file.fieldname === "thumbnailImage" && !imageExt.includes(ext)) {
        return cb(new Error("Invalid image file format"), false);
    }

    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});
