console.log("🚀 Starting app...");
console.log(
  "📂 Loading calculator routes from:",
  require.resolve("./routes/calculator.routes.js")
);

const express = require("express");
require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");

const app = express();

app.use(express.json());

app.use("/api", calculatorRoutes);

module.exports = app;

// npm run dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5431;
  app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
  });
}
