// ===============================
// MISTER - MAIN JAVASCRIPT
// ===============================

let reports = JSON.parse(localStorage.getItem("misterReports")) || [];


// ===============================
// MENU
// ===============================

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("open");
}


// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageName);

  if (page) {
    page.classList.add("active");
  }

  document.getElementById("sideMenu").classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageName === "dashboard") {
    updateDashboard();
  }

  if (pageName === "ownerPanel") {
    renderOwnerReports();
  }
}


// ===============================
// OWNER LOGIN WINDOW
// ===============================

function openOwner() {

  document.getElementById("ownerModal").classList.add("show");

  document.getElementById("ownerPassword").value = "";

  document.getElementById("ownerMessage").textContent = "";
}


function closeOwner() {

  document.getElementById("ownerModal").classList.remove("show");
}


// ===============================
// OWNER LOGIN
// ===============================

// Demo password.
// IMPORTANT:
// Real production authentication will be moved
// to server.js so the password is not exposed
// in the browser.

const OWNER_PASSWORD = "12345678mister";


function ownerLogin() {

  const password =
    document.getElementById("ownerPassword").value;

  const message =
    document.getElementById("ownerMessage");


  if (password === OWNER_PASSWORD) {

    message.textContent = "Access granted.";

    setTimeout(() => {

      closeOwner();

      showPage("ownerPanel");

    }, 500);

  } else {

    message.textContent = "Incorrect password.";

  }
}


// ===============================
// SUBMIT REPORT
// ===============================

document
  .getElementById("reportForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();


    const targetNumber =
      document.getElementById("targetNumber").value.trim();

    const reason =
      document.getElementById("reason").value;

    const evidence =
      document.getElementById("evidence").value.trim();

    const details =
      document.getElementById("details").value.trim();


    if (!targetNumber || !reason || !details) {

      alert("Please complete the required fields.");

      return;
    }


    const report = {

      id: Date.now(),

      targetNumber: targetNumber,

      reason: reason,

      evidence: evidence,

      details: details,

      status: "Pending",

      createdAt: new Date().toLocaleString()

    };


    reports.unshift(report);


    localStorage.setItem(
      "misterReports",
      JSON.stringify(reports)
    );


    alert(
      "Report submitted successfully. It is now Pending."
    );


    document
      .getElementById("reportForm")
      .reset();


    updateDashboard();

    renderOwnerReports();

  });


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

  const total =
    reports.length;

  const pending =
    reports.filter(r => r.status === "Pending").length;

  const escalated =
    reports.filter(r => r.status === "Escalated").length;


  const weekly =
    reports.filter(r => {

      const reportDate =
        new Date(r.id);

      const now =
        new Date();

      const difference =
        now - reportDate;

      const sevenDays =
        7 * 24 * 60 * 60 * 1000;

      return difference <= sevenDays;

    }).length;


  document.getElementById(
    "totalReports"
  ).textContent = total;


  document.getElementById(
    "pendingReports"
  ).textContent = pending;


  document.getElementById(
    "escalatedReports"
  ).textContent = escalated;


  document.getElementById(
    "weeklyReports"
  ).textContent = weekly;


  renderHistory();
}


// ===============================
// REPORT HISTORY
// ===============================

function renderHistory() {

  const container =
    document.getElementById("reportHistory");


  if (!reports.length) {

    container.innerHTML =
      "<p>No reports yet.</p>";

    return;
  }


  container.innerHTML = "";


  reports.forEach(report => {

    const item =
      document.createElement("div");

    item.className =
      "report-item";


    item.innerHTML = `

      <strong>
        Target: ${escapeHTML(report.targetNumber)}
      </strong>

      <p>
        Reason:
        ${escapeHTML(report.reason)}
      </p>

      <p>
        Date:
        ${escapeHTML(report.createdAt)}
      </p>

      <span class="status">
        ${escapeHTML(report.status)}
      </span>

    `;


    container.appendChild(item);

  });
}


// ===============================
// OWNER REPORTS
// ===============================

function renderOwnerReports() {

  const container =
    document.getElementById("ownerReports");


  if (!reports.length) {

    container.innerHTML =
      "<p>No reports available.</p>";

    return;
  }


  container.innerHTML = "";


  reports.forEach(report => {

    const item =
      document.createElement("div");

    item.className =
      "owner-report";


    item.innerHTML = `

      <h3>
        Report #${report.id}
      </h3>

      <p>
        <strong>Target:</strong>
        ${escapeHTML(report.targetNumber)}
      </p>

      <p>
        <strong>Reason:</strong>
        ${escapeHTML(report.reason)}
      </p>

      <p>
        <strong>Evidence:</strong>
        ${escapeHTML(report.evidence || "None")}
      </p>

      <p>
        <strong>Details:</strong>
        ${escapeHTML(report.details)}
      </p>

      <p>
        <strong>Date:</strong>
        ${escapeHTML(report.createdAt)}
      </p>

      <p>
        <strong>Status:</strong>
        ${escapeHTML(report.status)}
      </p>

      <div class="owner-actions">

        <button
          class="approve"
          onclick="changeReportStatus(${report.id}, 'Approved')">
          Approve
        </button>

        <button
          class="reject"
          onclick="changeReportStatus(${report.id}, 'Rejected')">
          Reject
        </button>

        <button
          class="escalate"
          onclick="changeReportStatus(${report.id}, 'Escalated')">
          Escalate
        </button>

      </div>

    `;


    container.appendChild(item);

  });
}


// ===============================
// CHANGE REPORT STATUS
// ===============================

function changeReportStatus(id, status) {

  const report =
    reports.find(r => r.id === id);


  if (!report) {
    return;
  }


  report.status = status;


  localStorage.setItem(
    "misterReports",
    JSON.stringify(reports)
  );


  renderOwnerReports();

  updateDashboard();

}


// ===============================
// HTML SAFETY
// ===============================

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


// ===============================
// INITIAL LOAD
// ===============================

updateDashboard();