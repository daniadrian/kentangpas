const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();

require("./models/db.js");

const calculatorRoutes = require("./routes/calculator.routes.js");
const articleRoutes = require("./routes/article.routes.js");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
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
