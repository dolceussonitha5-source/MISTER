const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Owner password la pral soti nan Render Environment Variables.
// Pa mete modpas la dirèkteman nan server.js.
const OWNER_PASSWORD =
  process.env.OWNER_PASSWORD || "CHANGE_ME";


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ===============================
// STATIC WEBSITE
// ===============================

app.use(express.static(
  path.join(__dirname)
));


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});


// ===============================
// OWNER LOGIN
// ===============================

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


  return res.json({
    success: true,
    message: "Owner access granted."
  });

});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/status", (req, res) => {

  res.json({
    success: true,
    service: "MISTER",
    status: "online"
  });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `MISTER server running on port ${PORT}`
  );

});