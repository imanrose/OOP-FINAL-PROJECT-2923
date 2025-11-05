// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let mealPlans = [];
const dataFile = path.join(__dirname, 'data', 'plans.json'); // make sure folder exists

//  Load saved data from plans.json
function loadMealPlans() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      mealPlans = JSON.parse(data);
    } else {
      mealPlans = [];
    }
  } catch (err) {
    console.error("Error reading plans.json:", err);
    mealPlans = [];
  }
}

//  Save to plans.json
function saveMealPlans() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(mealPlans, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving plans.json:", err);
  }
}

//  Create Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

//  Meal Plan Window
function createMealWindow(mealName) {
  const mealWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mealWindow.loadFile(path.join(__dirname, 'renderer', 'meal.html'));
  mealWindow.webContents.on('did-finish-load', () => {
    mealWindow.webContents.send('meal-selected', mealName);
  });
}

//  View Saved Meal Plans
function createViewWindow() {
  const viewWindow = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  viewWindow.loadFile(path.join(__dirname, 'renderer', 'view.html'));

  viewWindow.webContents.on('did-finish-load', () => {
    viewWindow.webContents.send('meal-plans-data', mealPlans);
  });
}

//  Edit Meal Plan Window
function createEditWindow(plan) {
  const editWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  editWindow.loadFile(path.join(__dirname, 'renderer', 'edit.html'));

  editWindow.webContents.on('did-finish-load', () => {
    editWindow.webContents.send('edit-plan', plan);
  });
}

//  Suggested Sunnah Meal Window (IMPORTANT: moved higher)
function createSunnahWindow() {
  const sunnahWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Suggested Sunnah Meals",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  sunnahWindow.loadFile(path.join(__dirname, 'renderer', 'sunnah.html'));
}

// IPC Listeners
ipcMain.on('open-meal-window', (event, mealName) => createMealWindow(mealName));
ipcMain.on('open-view-window', () => createViewWindow());
ipcMain.on('open-edit-window', (event, plan) => createEditWindow(plan));
ipcMain.on('open-sunnah-window', () => createSunnahWindow());

//  Save new meal plan
ipcMain.on('save-meal-plan', (event, data) => {
  const newPlan = {
    meal: data.meal || "Unnamed Meal",
    date: data.date || "No date",
    note: data.note || "",
  };
  mealPlans.push(newPlan);
  saveMealPlans();
  BrowserWindow.getAllWindows().forEach(win =>
    win.webContents.send('meal-plans-data', mealPlans)
  );
});

//  Delete meal plan
ipcMain.on('delete-meal-plan', (event, index) => {
  mealPlans.splice(index, 1);
  saveMealPlans();
  BrowserWindow.getAllWindows().forEach(win =>
    win.webContents.send('meal-plans-data', mealPlans)
  );
});

//  Update meal plan
ipcMain.on('update-meal-plan', (event, updatedPlan) => {
  const { index, date, note } = updatedPlan;
  if (mealPlans[index]) {
    mealPlans[index].date = date;
    mealPlans[index].note = note;
    saveMealPlans();
  }
  BrowserWindow.getAllWindows().forEach(win =>
    win.webContents.send('meal-plans-data', mealPlans)
  );
});

//  Start the app
app.whenReady().then(() => {
  loadMealPlans();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
