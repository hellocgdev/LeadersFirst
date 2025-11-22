// controllers/authController.js
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRE || "7d";

// In-memory OTP store; replace with Redis/DB in production
const otpStore = new Map();

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// Step 1: request OTP
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Step 2: verify OTP and register (roles: user/author/admin)
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, password, role, otp } = req.body;

    if (!email || !password || !otp) {
      return res
        .status(400)
        .json({ message: "Email, password and OTP required" });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: "OTP expired or not requested" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    otpStore.delete(email);

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // allow only user/author/admin, but block self‑assigned admin
    const allowedRoles = ["user", "author", "admin"];
    let safeRole = allowedRoles.includes(role) ? role : "user";
    if (safeRole === "admin") safeRole = "user";

    const user = await User.create({ email, password, role: safeRole });
    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Me (used by header / dashboard)
const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  user.ensurePeriodWindow?.();
  await user.save?.();

  res.json({
    success: true,
    data: {
      email: user.email,
      role: user.role,
      planStatus: user.planStatus,
      planName: user.stripeSubscriptionId ? user.planName || null : null,
      publishedCountPeriod: user.publishedCountPeriod,
      periodStart: user.periodStart,
      planRenewsAt: user.planRenewsAt,
    },
  });
};

export default {
  requestOtp,
  verifyOtpAndRegister,
  login,
  me,
};
