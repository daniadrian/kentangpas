const express = require("express");
const cors = require("cors");

require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");
const articleRoutes = require("./routes/article.routes.js");
const app = express();
const allowed = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://kentangpas.cloud",
  "https://www.kentangpas.cloud",
]);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    cb(null, allowed.has(origin));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.use("/api", calculatorRoutes);
app.use("/api/articles", articleRoutes);

module.exports = app;
const PORT = process.env.PORT || 5431;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server berjalan di http://127.0.0.1:${PORT}`);
});
