// ==================== LOAD EARNINGS & DOCUMENTS ====================

async function loadEarnings() {
  try {
    const user = await apiRequest("/profile/get.php");
    const earnings = await apiRequest("/profile/earnings.php");

    // Update sold count
    const soldCountEl = document.getElementById("soldCount");
    if (soldCountEl) soldCountEl.textContent = user.sold_count || 0;

    // Update total earnings card
    const earningsAmountEl = document.querySelector(".balance-amount");
    if (earningsAmountEl) {
      earningsAmountEl.innerHTML =
        parseFloat(earnings.total_earned || 0).toFixed(2) + " <span>TND</span>";
    }

    // Display earnings documents
    const container = document.querySelector(".earnings-list");
    if (!container) {
      // Create container if it doesn't exist
      const section = document.querySelector("main");
      if (section) {
        const div = document.createElement("div");
        div.className = "earnings-list";
        section.appendChild(div);
      }
      return;
    }

    if (!earnings.documents || earnings.documents.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">You haven\'t uploaded any documents yet.</p>';
      return;
    }

    container.innerHTML = earnings.documents
      .map(
        (doc) => `
        <div class="earnings-item">
          <div class="earnings-info">
            <div class="earnings-doc-icon subject-algo">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="earnings-details">
              <h4>${doc.titre}</h4>
              <span class="earnings-meta">Price: ${parseFloat(doc.prix).toFixed(2)} DT · Sales: ${doc.sales_count || 0}</span>
            </div>
          </div>
          <div class="earnings-earned">
            <span class="earnings-amount">${parseFloat(doc.total_earned || 0).toFixed(2)} DT</span>
          </div>
        </div>
      `,
      )
      .join("");
  } catch (err) {
    console.log("Earnings error:", err.message);
  }
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }

  loadEarnings();
});
