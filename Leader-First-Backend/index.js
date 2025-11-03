import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.js";
import articleRoute from "./routes/article.js";
import uploadRoute from "./routes/upload.js";

// 1. Load environment variables FIRST
dotenv.config();

// 2. Then use them
const port = process.env.PORT || 8080;

// 3. Create Express app
const app = express();

// 4. CORS - Update origin to match your React app
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://leader-first.onrender.com",
      "https://leader-first-kfvarztd4-rahul-kanojias-projects.vercel.app",
    ],
    credentials: true,
  })
);

// 5. Body parsers with increased limits for images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 6. Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 7. Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Blog API is running",
    timestamp: new Date().toISOString(),
  });
});

// 8. API Routes
app.use("/api/auth", authRoute);
app.use("/api/articles", articleRoute);
app.use("/api/upload", uploadRoute);

// 9. 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// 10. Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 11. Connect to database and start server
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`\n🚀 Server running on http://localhost:${port}`);
      console.log("\n📋 Available routes:");
      console.log("  GET    /");
      console.log("  POST   /api/auth/register");
      console.log("  POST   /api/auth/login");
      console.log("  GET    /api/articles");
      console.log("  GET    /api/articles/:id");
      console.log("  POST   /api/articles (auth required)");
      console.log("  PUT    /api/articles/:id (auth required)");
      console.log("  DELETE /api/articles/:id (auth required)");
      console.log("  POST   /api/upload/thumbnail (auth required)");
      console.log("  POST   /api/upload/content-image (auth required)");
      console.log(
        "\n⚙️  CORS enabled for: http://localhost:3000, http://localhost:5173"
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
