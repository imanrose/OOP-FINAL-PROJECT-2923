const { ipcRenderer } = require("electron");

let currentMeal = null;

// Receive selected meal from main.js
ipcRenderer.on("meal-selected", (event, mealName) => {
  currentMeal = mealName || "Unnamed Meal";
  document.getElementById("mealTitle").textContent = `Plan for: ${currentMeal}`;
});

// Save button
document.getElementById("savePlanBtn").addEventListener("click", () => {
  const date = document.getElementById("mealDate").value;
  const note = document.getElementById("mealNote").value.trim();
  const successMsg = document.getElementById("successMsg");

  if (!date || !note) {
    alert("Please fill in both date and note!");
    return;
  }

  // Send data to main process
  ipcRenderer.send("save-meal-plan", { meal: currentMeal, date, note });

  // Show success message
  successMsg.style.display = "block";
  successMsg.textContent = "Successfully saved!";

  // Close window after 1 second
  setTimeout(() => {
    window.close();
  }, 1000);
});

// Back button closes the window without saving
document.getElementById("backBtn").addEventListener("click", () => {
  window.close();
});
