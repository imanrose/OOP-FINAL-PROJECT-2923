const { ipcRenderer } = require("electron");

function loadPlans(plans) {
  const container = document.getElementById("plans");
  container.innerHTML = "";

  if (!plans || plans.length === 0) {
    container.innerHTML = "<p>No meal plans found.</p>";
    return;
  }

  plans.forEach((plan, index) => {
    const div = document.createElement("div");
    div.classList.add("plan-item");

    div.innerHTML = `
      <h3>${plan.meal || "Unnamed Meal"}</h3>
      <p><strong>Date:</strong> ${plan.date || "Not set"}</p>
      <p><strong>Note:</strong> ${plan.note || "No notes"}</p>
      <div class="plan-buttons">
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
      </div>
    `;

    // Edit
    div.querySelector(".editBtn").addEventListener("click", () => {
      ipcRenderer.send("open-edit-window", { ...plan, index });
    });

    // Delete
    div.querySelector(".deleteBtn").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this plan?")) {
        ipcRenderer.send("delete-meal-plan", index);
      }
    });

    container.appendChild(div);
  });
}

// Receive all plans
ipcRenderer.on("meal-plans-data", (event, plans) => {
  loadPlans(plans);
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("get-meal-plans");
});
