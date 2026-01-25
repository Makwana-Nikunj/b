import { Router } from 'express';
import {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos

} from "../controllers/video.controller.js"
import { verifyJwt, optionalAuth } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllVideos);

// Public route with optional auth (to track watch history if logged in)
router.route("/:videoId").get(optionalAuth, getVideoById);

// Protected routes (authentication required)
router.use(verifyJwt);

router
    .route("/")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnailImage",
                maxCount: 1,
            },

        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
