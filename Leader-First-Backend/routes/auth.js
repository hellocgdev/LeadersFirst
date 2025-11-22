// routes/authRoutes.js
import express from "express";
import authController from "../controller/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// OTP-based registration
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp-register", authController.verifyOtpAndRegister);

// Login with email/password
router.post("/login", authController.login);

// Current user (needs JWT)
router.get("/me", requireAuth, authController.me);

export default router;
