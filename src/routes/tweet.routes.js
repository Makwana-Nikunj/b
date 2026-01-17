import { Router } from 'express';
import {
    createTweet
} from "../controllers/tweet.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

router.route("/").post(createTweet);



export default router