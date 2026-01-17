import { Router } from 'express';
import {
    toggleVideoLike
} from "../controllers/like.controller.js"

import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);

export default router