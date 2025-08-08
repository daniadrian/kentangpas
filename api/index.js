const express = require("express");
const app = express();

app.get("/api/test", (req, res) => {
  console.log("SUCCESS: /api/test endpoint was hit!");

  res.status(200).json({
    status: "success",
    message: "Hello from Vercel! The basic server is working correctly.",
  });
});

module.exports = app;
