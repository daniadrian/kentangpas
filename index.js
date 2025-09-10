const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");
const articleRoutes = require("./routes/article.routes.js");
const app = express();
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = allowed.length
  ? {
      origin(origin, cb) {
        if (!origin || allowed.includes(origin)) return cb(null, true);
        return cb(new Error("CORS not allowed for this origin"), false);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    }
  : {};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use("/api", calculatorRoutes);
app.use("/api/articles", articleRoutes);

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5431;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  });
}
