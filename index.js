const express = require("express");
require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", calculatorRoutes);
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
