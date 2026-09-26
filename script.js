// ==========================================
// MISTER REPORT CENTER
// Frontend API Controller
// ==========================================

let ownerPassword = "";
let currentReportId = "";


// ==========================================
// MENU
// ==========================================

function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");

  if (!menu || !overlay) return;

  menu.classList.toggle("open");
  overlay.classList.toggle("show");
}


function closeMenu() {
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");

  if (!menu || !overlay) return;

  menu.classList.remove("open");
  overlay.classList.remove("show");
}


// ==========================================
// PAGE NAVIGATION
// ==========================================

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

    if (!ownerPassword) {
      openOwner();
      return;
    }

    loadOwnerReports();
  }
}


// ==========================================
// OWNER LOGIN MODAL
// ==========================================

function openOwner() {

  closeMenu();


  const modal =
    document.getElementById("ownerModal");

  const password =
    document.getElementById("ownerPassword");

  const message =
    document.getElementById("ownerMessage");


  if (modal) {
    modal.classList.add("show");
  }


  if (password) {
    password.value = "";
    password.focus();
  }


  if (message) {
    message.textContent = "";
  }
}


function closeOwner() {

  const modal =
    document.getElementById("ownerModal");


  if (modal) {
    modal.classList.remove("show");
  }
}


// ==========================================
// OWNER LOGIN
// ==========================================

async function ownerLogin() {

  const passwordInput =
    document.getElementById("ownerPassword");

  const message =
    document.getElementById("ownerMessage");


  if (!passwordInput) return;


  const password =
    passwordInput.value.trim();


  if (!password) {

    if (message) {
      message.textContent =
        "Enter the Owner password.";
    }

    return;
  }


  if (message) {
    message.textContent =
      "Checking access...";
  }


  try {

    const response =
      await fetch("/api/owner/login", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          password
        })

      });


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      if (message) {
        message.textContent =
          "Incorrect password.";
      }

      return;
    }


    // Keep the password only during
    // the current browser session.
    ownerPassword = password;


    if (message) {
      message.textContent =
        "Access granted.";
    }


    setTimeout(() => {

      closeOwner();

      showPage("ownerPanel");

    }, 400);


  } catch (error) {

    console.error(
      "Owner login error:",
      error
    );


    if (message) {
      message.textContent =
        "Server connection failed.";
    }
  }
}


// ==========================================
// SUBMIT REPORT
// ==========================================

const reportForm =
  document.getElementById("reportForm");


if (reportForm) {

  reportForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const targetNumber =
        document
          .getElementById("targetNumber")
          .value
          .trim();


      const reason =
        document
          .getElementById("reason")
          .value
          .trim();


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


      const submitButton =
        reportForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          "Submitting...";
      }


      try {

        const response =
          await fetch("/api/reports", {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              targetNumber,

              reason,

              evidence,

              details

            })

          });


        const data =
          await response.json();


        if (!response.ok || !data.success) {

          throw new Error(
            data.message ||
            "Unable to submit report."
          );
        }


        currentReportId =
          data.report.id;


        reportForm.reset();


        alert(
          "Report submitted successfully.\n\n" +
          "Your Report ID:\n" +
          data.report.id
        );


        updateDashboard();


      } catch (error) {

        console.error(
          "Report submission error:",
          error
        );


        alert(
          error.message ||
          "Server connection failed."
        );


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Submit Report →";
        }
      }

    }
  );

}


// ==========================================
// DASHBOARD
// ==========================================

async function updateDashboard() {

  try {

    /*
      The public API only returns
      the report's basic status.
      It does not expose private
      report details.
    */

    if (!currentReportId) {

      renderEmptyDashboard();

      return;
    }


    const response =
      await fetch(
        "/api/reports/" +
        encodeURIComponent(
          currentReportId
        )
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      renderEmptyDashboard();

      return;
    }


    const report =
      data.report;


    const totalElement =
      document.getElementById(
        "totalReports"
      );


    const pendingElement =
      document.getElementById(
        "pendingReports"
      );


    const escalatedElement =
      document.getElementById(
        "escalatedReports"
      );


    const weeklyElement =
      document.getElementById(
        "weeklyReports"
      );


    if (totalElement) {
      totalElement.textContent = "1";
    }


    if (pendingElement) {
      pendingElement.textContent =
        report.status === "Pending"
          ? "1"
          : "0";
    }


    if (escalatedElement) {
      escalatedElement.textContent =
        report.status === "Escalated"
          ? "1"
          : "0";
    }


    if (weeklyElement) {
      weeklyElement.textContent = "1";
    }


    renderHistory(report);


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

    renderEmptyDashboard();
  }
}


// ==========================================
// EMPTY DASHBOARD
// ==========================================

function renderEmptyDashboard() {

  const totalElement =
    document.getElementById(
      "totalReports"
    );


  const pendingElement =
    document.getElementById(
      "pendingReports"
    );


  const escalatedElement =
    document.getElementById(
      "escalatedReports"
    );


  const weeklyElement =
    document.getElementById(
      "weeklyReports"
    );


  if (totalElement) {
    totalElement.textContent = "0";
  }


  if (pendingElement) {
    pendingElement.textContent = "0";
  }


  if (escalatedElement) {
    escalatedElement.textContent = "0";
  }


  if (weeklyElement) {
    weeklyElement.textContent = "0";
  }


  const history =
    document.getElementById(
      "reportHistory"
    );


  if (history) {

    history.innerHTML = `
      <div class="empty-state">
        No report selected yet.
      </div>
    `;

  }
}


// ==========================================
// REPORT HISTORY
// ==========================================

function renderHistory(report) {

  const container =
    document.getElementById(
      "reportHistory"
    );


  if (!container) return;


  if (!report) {

    container.innerHTML = `
      <div class="empty-state">
        No report submitted yet.
      </div>
    `;

    return;
  }


  container.innerHTML = `

    <div class="report-item">

      <strong>
        Report ID:
        ${escapeHTML(report.id)}
      </strong>

      <p>
        Status:
        <span class="status">
          ${escapeHTML(report.status)}
        </span>
      </p>

      <p>
        Submitted:
        ${formatDate(report.createdAt)}
      </p>

      <p>
        Last updated:
        ${formatDate(report.updatedAt)}
      </p>

    </div>

  `;
}


// ==========================================
// OWNER REPORTS
// ==========================================

async function loadOwnerReports() {

  const container =
    document.getElementById(
      "ownerReports"
    );


  if (!container) return;


  if (!ownerPassword) {

    container.innerHTML = `
      <div class="empty-state">
        Owner authentication required.
      </div>
    `;

    return;
  }


  container.innerHTML = `
    <div class="empty-state">
      Loading reports...
    </div>
  `;


  try {

    const response =
      await fetch(
        "/api/reports",
        {
          method: "GET",

          headers: {
            "x-owner-password":
              ownerPassword
          }
        }
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      if (response.status === 401) {

        ownerPassword = "";

      }


      throw new Error(
        data.message ||
        "Unable to load reports."
      );
    }


    renderOwnerReports(
      data.reports || []
    );


  } catch (error) {

    console.error(
      "Owner reports error:",
      error
    );


    container.innerHTML = `
      <div class="empty-state">
        ${escapeHTML(
          error.message ||
          "Unable to load reports."
        )}
      </div>
    `;
  }
}


// ==========================================
// RENDER OWNER REPORTS
// ==========================================

function renderOwnerReports(reports) {

  const container =
    document.getElementById(
      "ownerReports"
    );


  if (!container) return;


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
        Report
        #${escapeHTML(report.id)}
      </h3>

      <p>
        <strong>Target:</strong>
        ${escapeHTML(
          report.targetNumber
        )}
      </p>

      <p>
        <strong>Reason:</strong>
        ${escapeHTML(
          report.reason
        )}
      </p>

      <p>
        <strong>Evidence:</strong>
        ${escapeHTML(
          report.evidence || "None"
        )}
      </p>

      <p>
        <strong>Details:</strong>
        ${escapeHTML(
          report.details
        )}
      </p>

      <p>
        <strong>Submitted:</strong>
        ${formatDate(
          report.createdAt
        )}
      </p>

      <p>
        <strong>Status:</strong>
        ${escapeHTML(
          report.status
        )}
      </p>

      <div class="owner-actions">

        <button
          class="approve"
          onclick="changeReportStatus(
            '${escapeJS(report.id)}',
            'Approved'
          )"
        >
          Approve
        </button>

        <button
          class="reject"
          onclick="changeReportStatus(
            '${escapeJS(report.id)}',
            'Rejected'
          )"
        >
          Reject
        </button>

        <button
          class="escalate"
          onclick="changeReportStatus(
            '${escapeJS(report.id)}',
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


// ==========================================
// CHANGE REPORT STATUS
// ==========================================

async function changeReportStatus(
  id,
  status
) {

  if (!ownerPassword) {

    alert(
      "Owner authentication required."
    );

    openOwner();

    return;
  }


  const confirmed =
    confirm(
      `Change this report to "${status}"?`
    );


  if (!confirmed) return;


  try {

    const response =
      await fetch(

        "/api/reports/" +
        encodeURIComponent(id) +
        "/status",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "x-owner-password":
              ownerPassword

          },

          body: JSON.stringify({
            status
          })

        }

      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      if (response.status === 401) {

        ownerPassword = "";

        alert(
          "Owner authentication expired."
        );

        openOwner();

        return;
      }


      throw new Error(
        data.message ||
        "Unable to change report status."
      );
    }


    alert(
      `Report ${status.toLowerCase()} successfully.`
    );


    loadOwnerReports();


    if (
      currentReportId === id
    ) {

      updateDashboard();

    }


  } catch (error) {

    console.error(
      "Status update error:",
      error
    );


    alert(
      error.message ||
      "Server connection failed."
    );
  }
}


// ==========================================
// LOGOUT OWNER
// ==========================================

function ownerLogout() {

  ownerPassword = "";

  closeMenu();

  showPage("home");

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(value) {

  if (!value) {
    return "Unknown";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return escapeHTML(value);

  }


  return escapeHTML(
    date.toLocaleString()
  );
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ==========================================
// JAVASCRIPT STRING SECURITY
// ==========================================

function escapeJS(value) {

  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}


// ==========================================
// INITIALIZE
// ==========================================

updateDashboard();