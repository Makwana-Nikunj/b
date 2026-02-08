import { Router } from "express";
import {
    initiateRegister,
    verifyEmailToken,
    forgotPassword,
    verifyOTP,
    resetPassword
} from "../controllers/auth.controller.js";

const router = Router();

// Email verification flow
router.route("/initiate-register").post(initiateRegister);
router.route("/verify-email/:token").get(verifyEmailToken);

// Password reset flow
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOTP);
router.route("/reset-password").post(resetPassword);

export default router;
