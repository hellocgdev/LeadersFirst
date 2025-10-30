import jwt from "jsonwebtoken";
import User from "../models/User.js";
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "email already registered" });

    // Do not allow public admin creation
    const safeRole = role === "admin" ? "user" : role || "user";

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    const token = signToken(user._id);
    return res.status(200).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  return res.status(200).json({
    user: { id: req.user._id, email: req.user.email, role: req.user.role },
  });
};

export default { register, login, me };
