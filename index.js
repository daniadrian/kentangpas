const express = require("express");
const cors = require("cors");

require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");
const articleRoutes = require("./routes/article.routes.js");

const app = express();

// ==== CORS (izinkan FE lokal & domain produksi) ====
const allowed = [
  "http://localhost:3000",
  "https://kentangpas.cloud",
  "https://www.kentangpas.cloud",
];
app.use(
  cors({
    origin(origin, cb) {
      // izinkan tools seperti curl/postman (no Origin)
      if (!origin) return cb(null, true);
      cb(null, allowed.includes(origin));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ==== Healthcheck sederhana ====
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// ==== Routes aplikasi ====
app.use("/api", calculatorRoutes);
app.use("/api/articles", articleRoutes);

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5431;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  });
}
