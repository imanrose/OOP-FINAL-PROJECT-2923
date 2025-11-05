// renderer/index.js
const { ipcRenderer } = require('electron');

const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');
const homeImage = document.querySelector('.home-image');
const banner = document.querySelector('.banner');
const homeBtn = document.getElementById('homeBtn');
const viewBtn = document.getElementById('viewBtn');
const sunnahBtn = document.getElementById('sunnahBtn');

let allRecipes = []; // store recipes fetched
let currentMeal = '';

// helper: escape HTML
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// render function that accepts array of recipes
function renderRecipes(list) {
  resultDiv.innerHTML = '';
  if (!list || list.length === 0) {
    resultDiv.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'recipe-grid';

  list.forEach((meal) => {
    const box = document.createElement('div');
    box.className = 'recipe-box';

    const used = (meal.usedIngredients || []).map(i => i.name).join(', ');
    const missed = (meal.missedIngredients || []).map(i => i.name).join(', ');

    box.innerHTML = `
      <img src="${meal.image}" alt="${meal.title}" class="recipe-img">
      <div class="recipe-title">${escapeHtml(meal.title)}</div>
      <div class="recipe-desc"><b>Used:</b> ${escapeHtml(used || '—')}</div>
      <div class="recipe-desc"><b>Missed:</b> ${escapeHtml(missed || '—')}</div>
      <div style="margin-top:10px;">
        <button class="add-plan-btn">Add to Plan</button>
      </div>
    `;

    // add listeners
    box.querySelector('.add-plan-btn').addEventListener('click', () => {
      ipcRenderer.send('open-meal-window', meal.title);
    });

    grid.appendChild(box);
  });

  resultDiv.appendChild(grid);
}

// search & fetch from Spoonacular
searchBtn.addEventListener('click', async () => {
  const ingredient = document.getElementById("mealInput").value.trim();
  resultDiv.innerHTML = "<p>Loading recipes...</p>";

  if (!ingredient) {
    resultDiv.innerHTML = "<p>Please enter an ingredient.</p>";
    return;
  }

  // Hide banner & home image, show Home button
  if (homeImage) homeImage.style.display = 'none';
  if (banner) banner.style.display = 'none';
  homeBtn.style.display = 'inline-block';

  try {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=153ed267f6fe4cc1978d7d8576103378&ingredients=${encodeURIComponent(ingredient)}&number=12`
    );

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    allRecipes = Array.isArray(data) ? data : [];
    renderRecipes(allRecipes);
  } catch (err) {
    console.error("Error fetching recipe data:", err);
    resultDiv.innerHTML = `<p>Error fetching recipe data: ${escapeHtml(err.message)}</p>`;
  }
});

// VIEW MEAL PLANS
viewBtn.addEventListener('click', () => {
  ipcRenderer.send('open-view-window');
});

// HOME BUTTON
homeBtn.addEventListener('click', () => {
  if (homeImage) homeImage.style.display = 'block';
  if (banner) banner.style.display = 'block';
  resultDiv.innerHTML = "";
  document.getElementById("mealInput").value = "";
  homeBtn.style.display = 'none';
});

// SUGGESTED SUNNAH BUTTON (fixed id)
if (sunnahBtn) {
  sunnahBtn.addEventListener('click', () => {
    ipcRenderer.send('open-sunnah-window');
  });
}
