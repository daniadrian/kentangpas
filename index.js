const express = require("express");
const cors = require("cors");
const app = express();
const allowList = new Set([
  "https://kentangpas.site",
  "https://www.kentangpas.site",
  "http://bibitku.filkom.ub.ac.id",
  "https://bibitku.filkom.ub.ac.id",
  "http://api-bibitku.filkom.ub.ac.id",
  "https://api-bibitku.filkom.ub.ac.id",
  "http://localhost:3000",
  "http://localhost:5173",
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API berjalan di http://0.0.0.0:${PORT}`);
});
