const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "CHANGE_ME";

const DATA_DIR = path.join(__dirname, "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

// Create data folder/file if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, "[]", "utf8");
}


// ===============================
// Middleware
// ===============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.static(__dirname));


// ===============================
// Helpers
// ===============================

function readReports() {
  try {
    const data = fs.readFileSync(REPORTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read reports:", error);
    return [];
  }
}


function saveReports(reports) {
  fs.writeFileSync(
    REPORTS_FILE,
    JSON.stringify(reports, null, 2),
    "utf8"
  );
}


function createId() {
  return crypto.randomUUID();
}


function ownerAuthenticated(req) {
  const password = req.headers["x-owner-password"];

  return (
    password &&
    password === OWNER_PASSWORD
  );
}


// ===============================
// Home
// ===============================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});


// ===============================
// Owner Login
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

  res.json({
    success: true,
    message: "Owner access granted."
  });
});


// ===============================
// Create Report
// ===============================

app.post("/api/reports", (req, res) => {

  const {
    targetNumber,
    reason,
    evidence,
    details
  } = req.body;


  if (
    !targetNumber ||
    !reason ||
    !details
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Target number, reason and details are required."
    });
  }


  const reports = readReports();


  const report = {
    id: createId(),

    targetNumber:
      String(targetNumber).trim(),

    reason:
      String(reason).trim(),

    evidence:
      String(evidence || "").trim(),

    details:
      String(details).trim(),

    status: "Pending",

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };


  reports.unshift(report);

  saveReports(reports);


  res.status(201).json({
    success: true,

    message:
      "Report submitted successfully.",

    report: {
      id: report.id,
      status: report.status,
      createdAt: report.createdAt
    }
  });
});


// ===============================
// Check One Report
// ===============================

app.get("/api/reports/:id", (req, res) => {

  const reports = readReports();

  const report = reports.find(
    item => item.id === req.params.id
  );


  if (!report) {
    return res.status(404).json({
      success: false,
      message: "Report not found."
    });
  }


  // Do not expose private evidence/details
  // on the public status endpoint.
  res.json({
    success: true,

    report: {
      id: report.id,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }
  });
});


// ===============================
// Owner: Get All Reports
// ===============================

app.get("/api/reports", (req, res) => {

  if (!ownerAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      message: "Owner authentication required."
    });
  }


  const reports = readReports();


  res.json({
    success: true,
    reports
  });
});


// ===============================
// Owner: Change Report Status
// ===============================

app.post("/api/reports/:id/status", (req, res) => {

  if (!ownerAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      message: "Owner authentication required."
    });
  }


  const { status } = req.body;


  const allowedStatuses = [
    "Approved",
    "Rejected",
    "Escalated"
  ];


  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status. Use Approved, Rejected or Escalated."
    });
  }


  const reports = readReports();


  const reportIndex = reports.findIndex(
    item => item.id === req.params.id
  );


  if (reportIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Report not found."
    });
  }


  reports[reportIndex].status = status;

  reports[reportIndex].updatedAt =
    new Date().toISOString();


  saveReports(reports);


  res.json({
    success: true,

    message:
      `Report ${status.toLowerCase()} successfully.`,

    report: reports[reportIndex]
  });
});


// ===============================
// Server Status
// ===============================

app.get("/api/status", (req, res) => {

  const reports = readReports();

  res.json({
    success: true,
    service: "MISTER",
    status: "online",
    reports: reports.length
  });
});


// ===============================
// 404 API Handler
// ===============================

app.use("/api", (req, res) => {

  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});


// ===============================
// Start Server
// ===============================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `MISTER server running on port ${PORT}`
    );

  }
);