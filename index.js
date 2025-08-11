const express = require("express");
require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");

const app = express();

app.use(express.json());

app.use("/api", calculatorRoutes);

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5431;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  });
}
