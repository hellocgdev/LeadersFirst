import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  requestOtp,
  verifyOtpAndRegister,
  login,
  me,
} from "../controller/authController.js";

const router = Router();

router.post("/register/request-otp", requestOtp);

router.post("/register/verify-otp", verifyOtpAndRegister);

router.post("/login", login);
router.get("/me", auth, me);

export default router;
