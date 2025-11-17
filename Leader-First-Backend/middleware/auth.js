import jwt from "jsonwebtoken";
import User from "../models/user.js";

export default async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid user" });

    req.user = { id: user._id, role: user.role, email: user.email };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
