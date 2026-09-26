const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Owner password soti nan Render Environment Variables
const OWNER_PASSWORD =
  process.env.OWNER_PASSWORD || "CHANGE_ME";


// Middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


// Static website
app.use(express.static(__dirname));


// Home
app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});


// Owner login
app.post("/api/owner/login", (req, res) => {

  const password = req.body.password;

  if (!password) {

    return res.status(400).json({
      success: false,
      message: "Password is required."
    });

  }


  if (password !== OWNER_PASSWORD) {

    return res.status(401).json({
      success: false,
      message: "Incorrect password."
    });

  }


  res.json({
    success: true,
    message: "Owner access granted."
  });

});


// Server status
app.get("/api/status", (req, res) => {

  res.json({
    success: true,
    service: "MISTER",
    status: "online"
  });

});


// Start server
app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `MISTER server running on port ${PORT}`
  );

});