const express = require("express");
const cors = require("cors");
const app = express();
const allowList = new Set([
  "https://kentangpas.site",
  "https://www.kentangpas.site",
]);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, false);
    cb(null, allowList.has(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

const calculatorRoutes = require("./routes/calculator.routes.js");
const articleRoutes = require("./routes/article.routes.js");

app.use("/api", calculatorRoutes);
app.use("/api/articles", articleRoutes);

const PORT = process.env.PORT || 5431;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`API berjalan di http://127.0.0.1:${PORT}`);
});
