import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

const admins = [
  { email: "admin1@example.com", password: "secret123", role: "admin" },
  { email: "admin2@example.com", password: "secret123", role: "admin" },
  { email: "admin3@example.com", password: "secret123", role: "admin" },
  { email: "admin4@example.com", password: "secret123", role: "admin" },
  { email: "admin5@example.com", password: "secret123", role: "admin" },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Upsert each admin: create if missing, otherwise ensure role=admin and reset password
    for (const a of admins) {
      const existing = await User.findOne({ email: a.email }).select(
        "+password"
      );
      if (!existing) {
        await User.create(a);
      } else {
        // update password and role safely
        existing.password = a.password; // will be re-hashed by pre('save')
        existing.role = "admin";
        await existing.save();
      }
    }
    console.log("Seeded 5 admins");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
