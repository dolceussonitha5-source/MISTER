// =====================================
// MISTER REPORT CENTER
// =====================================

let reports =
  JSON.parse(localStorage.getItem("misterReports")) || [];


// =====================================
// MENU
// =====================================

function toggleMenu() {

  const menu =
    document.getElementById("sideMenu");

  const overlay =
    document.getElementById("menuOverlay");

  menu.classList.toggle("open");

  overlay.classList.toggle("show");
}


function closeMenu() {

  document
    .getElementById("sideMenu")
    .classList.remove("open");

  document
    .getElementById("menuOverlay")
    .classList.remove("show");
}


// =====================================
// PAGE NAVIGATION
// =====================================

function showPage(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });


  const page =
    document.getElementById(pageName);

  if (!page) return;

  page.classList.add("active");

  closeMenu();

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


// =====================================
// OWNER MODAL
// =====================================

function openOwner() {

  closeMenu();

  document
    .getElementById("ownerModal")
    .classList.add("show");

  document
    .getElementById("ownerPassword")
    .value = "";

  document
    .getElementById("ownerMessage")
    .textContent = "";
}


function closeOwner() {

  document
    .getElementById("ownerModal")
    .classList.remove("show");
}


// =====================================
// OWNER LOGIN
// =====================================

async function ownerLogin() {

  const password =
    document
      .getElementById("ownerPassword")
      .value
      .trim();

  const message =
    document.getElementById("ownerMessage");


  if (!password) {

    message.textContent =
      "Enter the Owner password.";

    return;
  }


  message.textContent =
    "Checking access...";


  try {

    const response =
      await fetch("/api/owner/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          password: password
        })

      });


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      message.textContent =
        "Incorrect password.";

      return;
    }


    message.textContent =
      "Access granted.";

    setTimeout(() => {

      closeOwner();

      showPage("ownerPanel");

    }, 400);


  } catch (error) {

    message.textContent =
      "Server connection failed.";

    console.error(error);

  }
}


// =====================================
// SUBMIT REPORT
// =====================================

document
  .getElementById("reportForm")
  .addEventListener(
    "submit",
    function(event) {

      event.preventDefault();


      const targetNumber =
        document
          .getElementById("targetNumber")
          .value
          .trim();


      const reason =
        document
          .getElementById("reason")
          .value;


      const evidence =
        document
          .getElementById("evidence")
          .value
          .trim();


      const details =
        document
          .getElementById("details")
          .value
          .trim();


      if (
        !targetNumber ||
        !reason ||
        !details
      ) {

        alert(
          "Please complete all required fields."
        );

        return;
      }


      const report = {

        id: Date.now(),

        targetNumber,

        reason,

        evidence,

        details,

        status: "Pending",

        createdAt:
          new Date().toLocaleString()

      };


      reports.unshift(report);


      localStorage.setItem(
        "misterReports",
        JSON.stringify(reports)
      );


      alert(
        "Report submitted successfully."
      );


      document
        .getElementById("reportForm")
        .reset();


      updateDashboard();

    }
  );


// =====================================
// DASHBOARD
// =====================================

function updateDashboard() {

  const total =
    reports.length;


  const pending =
    reports.filter(
      report =>
        report.status === "Pending"
    ).length;


  const escalated =
    reports.filter(
      report =>
        report.status === "Escalated"
    ).length;


  const sevenDays =
    7 * 24 * 60 * 60 * 1000;


  const weekly =
    reports.filter(report => {

      return (
        Date.now() - report.id
        <= sevenDays
      );

    }).length;


  document
    .getElementById("totalReports")
    .textContent = total;


  document
    .getElementById("pendingReports")
    .textContent = pending;


  document
    .getElementById("escalatedReports")
    .textContent = escalated;


  document
    .getElementById("weeklyReports")
    .textContent = weekly;


  renderHistory();
}


// =====================================
// REPORT HISTORY
// =====================================

function renderHistory() {

  const container =
    document.getElementById("reportHistory");


  if (!reports.length) {

    container.innerHTML = `
      <div class="empty-state">
        No reports submitted yet.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  reports.forEach(report => {

    const item =
      document.createElement("div");

    item.className = "report-item";


    item.innerHTML = `

      <strong>
        Target: ${escapeHTML(report.targetNumber)}
      </strong>

      <p>
        Reason: ${escapeHTML(report.reason)}
      </p>

      <p>
        Submitted: ${escapeHTML(report.createdAt)}
      </p>

      <span class="status">
        ${escapeHTML(report.status)}
      </span>

    `;


    container.appendChild(item);

  });
}


// =====================================
// OWNER REPORTS
// =====================================

function renderOwnerReports() {

  const container =
    document.getElementById("ownerReports");


  if (!reports.length) {

    container.innerHTML = `
      <div class="empty-state">
        No reports available.
      </div>
    `;

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
        ${escapeHTML(
          report.evidence || "None"
        )}
      </p>

      <p>
        <strong>Details:</strong>
        ${escapeHTML(report.details)}
      </p>

      <p>
        <strong>Submitted:</strong>
        ${escapeHTML(report.createdAt)}
      </p>

      <p>
        <strong>Status:</strong>
        ${escapeHTML(report.status)}
      </p>

      <div class="owner-actions">

        <button
          class="approve"
          onclick="changeReportStatus(
            ${report.id},
            'Approved'
          )"
        >
          Approve
        </button>

        <button
          class="reject"
          onclick="changeReportStatus(
            ${report.id},
            'Rejected'
          )"
        >
          Reject
        </button>

        <button
          class="escalate"
          onclick="changeReportStatus(
            ${report.id},
            'Escalated'
          )"
        >
          Escalate
        </button>

      </div>

    `;


    container.appendChild(item);

  });
}


// =====================================
// CHANGE STATUS
// =====================================

function changeReportStatus(
  id,
  status
) {

  const report =
    reports.find(
      item => item.id === id
    );


  if (!report) return;


  report.status = status;


  localStorage.setItem(
    "misterReports",
    JSON.stringify(reports)
  );


  renderOwnerReports();

  updateDashboard();

}


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll(
      "'",
      "&#039;"
    );

}


// =====================================
// INITIALIZE
// =====================================

updateDashboard();