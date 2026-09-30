const express = require("express");

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route topilmadi" });
});

module.exports = app;
