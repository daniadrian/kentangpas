const express = require("express");
require("../models/db.js");
const calculatorRoutes = require("../routes/calculator.routes.js");

const app = express();

app.use(express.json());
app.use(calculatorRoutes);

module.exports = app;
