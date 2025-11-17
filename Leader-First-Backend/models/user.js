import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    // Billing & publish control
    planStatus: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
      index: true,
    },
    planRenewsAt: {
      type: Date,
      default: null, // set when subscription becomes active
    },
    publishedCountPeriod: {
      type: Number,
      default: 0, // number of published articles in the current window
    },
    periodStart: {
      type: Date,
      default: () => new Date(), // start of current counting window
    },
  },
  { timestamps: true }
);

// Hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Helpers for publish gating
// 1) ensure 30-day window; reset count when window expires
userSchema.methods.ensurePeriodWindow = function () {
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;
  const windowDays = 30; // adjust if you prefer calendar month
  if (!this.periodStart || (now - this.periodStart) / msInDay >= windowDays) {
    this.periodStart = now;
    this.publishedCountPeriod = 0;
  }
};

// 2) can this user publish without paying?
userSchema.methods.canPublish = function () {
  if (this.planStatus === "active") return true;
  return this.publishedCountPeriod < 1;
};

// 3) call after a successful publish (only for inactive plans)
userSchema.methods.incrementPublishCountIfNeeded = async function () {
  this.ensurePeriodWindow(); // keep if you want 30-day window; remove if lifetime cap
  if (this.planStatus !== "active") {
    this.publishedCountPeriod += 1;
  }
  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
