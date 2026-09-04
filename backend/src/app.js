const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const driveRoutes = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ============================================================
// TRUST PROXY
// ============================================================

app.set("trust proxy", 1);

// ============================================================
// SECURITY
// ============================================================

app.use(helmet());

// ============================================================
// CORS CONFIGURATION
// ============================================================

// Read additional origins from CLIENT_URL
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Production frontend + local development
const allowedOrigins = [
  "https://next-gen-placement-portal.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",

  ...configuredOrigins,
];

// Remove duplicates
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

console.log("==========================================");
console.log("Allowed CORS origins:");
console.log(uniqueAllowedOrigins);
console.log("==========================================");

const isAllowedOrigin = (origin) => {
  // Allow requests without Origin.
  // Examples: curl, Postman, server-to-server requests.
  if (!origin) {
    return true;
  }

  // Allow exact configured origins
  if (uniqueAllowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel preview deployments
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

// ============================================================
// REQUEST PARSING
// ============================================================

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ============================================================
// SECURITY SANITIZATION
// ============================================================

app.use(mongoSanitize());
app.use(hpp());

// ============================================================
// LOGGING
// ============================================================

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ============================================================
// RATE LIMITING
// ============================================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", globalLimiter);

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CareerConnect API is running",
    time: new Date().toISOString(),
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/recruiters", recruiterRoutes);

app.use("/api/drives", driveRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/notifications", notificationRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(notFound);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// EXPORT
// ============================================================

module.exports = app;
