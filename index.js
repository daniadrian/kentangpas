const express = require("express");
require("./models/db.js");
const calculatorRoutes = require("./routes/calculator.routes.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", calculatorRoutes);
app.listen(PORT, () => {
  console.log(`Server berhasil berjalan di port ${PORT}`);
});
