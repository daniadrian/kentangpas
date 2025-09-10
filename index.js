// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/** ------------ CORS ------------ **/
/**
 * ALLOWED_ORIGINS di .env bisa berisi beberapa origin, dipisah koma.
 * Contoh:
 *   http://localhost:3000,https://kentangpas.cloud,https://staging.kentangpas.cloud
 */
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Kalau ALLOWED_ORIGINS kosong -> izinkan semua (hati-hati, hanya untuk test) */
const corsOptions = allowed.length
  ? {
      origin(origin, cb) {
        // request tanpa Origin (curl/Postman) juga diizinkan
        if (!origin) return cb(null, true);
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error("CORS not allowed for: " + origin), false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false, // set true kalau pakai cookie/session
      maxAge: 86400, // cache preflight 24 jam
    }
  : {}; // default: semua origin

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
/** ------------ END CORS ------------ **/

app.use(express.json());

// routes kamu
app.use("/api", require("./routes/calculator.routes.js"));
app.use("/api/articles", require("./routes/article.routes.js"));

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5431;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  });
}
