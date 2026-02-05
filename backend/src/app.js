import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { performanceMonitor } from "./middlewares/performance.middleware.js";
import { keepAlive } from "./utils/keepAlive.js";

const app = express();

/**
 * IMPORTANT for Render (behind proxy)
 */
app.set("trust proxy", 1);

/**
 * Performance & Compression middleware (add first for best results)
 */
app.use(compression({
    level: 6,           // Compression level (0-9)
    threshold: 1024,    // Only compress responses > 1KB
}));
app.use(performanceMonitor);

/**
 * CORS configuration
 */
app.use(
    cors({
        origin: ["https://vidplay-ecru.vercel.app", "http://localhost:5173"],
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public", {
    maxAge: '1d',  // Cache static files for 1 day
    etag: true
}));
app.use(cookieParser());

/**
 * Health check endpoint (for keep-alive and monitoring)
 */
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Routes import
 */
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

/**
 * Routes declaration
 */
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    });
});

/**
 * Start keep-alive service in production
 */
if (process.env.NODE_ENV === 'production') {
    keepAlive();
}

export { app };
