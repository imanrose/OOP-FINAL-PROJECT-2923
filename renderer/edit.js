const { ipcRenderer } = require("electron");

let currentPlanIndex = null;

// Receive plan to edit
ipcRenderer.on("edit-plan", (event, plan) => {
  currentPlanIndex = plan.index;
  document.getElementById("editDate").value = plan.date;
  document.getElementById("editNote").value = plan.note;
});

// Save edited plan
document.getElementById("saveEditBtn").addEventListener("click", () => {
  const date = document.getElementById("editDate").value;
  const note = document.getElementById("editNote").value;

  if (!date || !note) {
    alert("Please fill both fields!");
    return;
  }

  ipcRenderer.send("update-meal-plan", { index: currentPlanIndex, date, note });

  const msg = document.getElementById("editMessage");
  msg.textContent = "Saved successfully!";
  setTimeout(() => window.close(), 1000);
});
