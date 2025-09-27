const API_KEY = "5dee691aeb352eacf0216894adc6b46a"; 
const BASE = "https://api.openweathermap.org/data/2.5";

const $ = s => document.querySelector(s);
const searchInput = $("#search");
const searchBtn = $("#searchBtn");
const currentBox = $("#current");
const forecastBox = $("#forecast-grid");
const loader = $("#loader");
const toggleBtn = $("#theme-toggle");
const welcomeMsg = $("#welcome-message");
const useLocationBtn = $("#use-location-btn");
const detailsBox = $("#details");

const show = el => el.classList.remove("hidden");
const hide = el => el.classList.add("hidden");

// Fetch Weather
async function getWeather(city) {
  try {
    hide(welcomeMsg);
    show(loader);
    hide(currentBox);
    hide(forecastBox);
    hide(detailsBox);

    const res = await fetch(`${BASE}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    renderCurrent(data);
    renderDetails(data);
    renderMap(data.coord.lat, data.coord.lon);
    await getForecast(city);
  } catch (e) {
    alert(e.message);
    show(welcomeMsg);
  } finally {
    hide(loader);
  }
}

// 5-Day Forecast
async function getForecast(city) {
  const res = await fetch(`${BASE}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
  const data = await res.json();
  renderForecast(data.list);
}

// Render Current
function renderCurrent(d) {
  currentBox.innerHTML = `
    <h2>${d.name}, ${d.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="${d.weather[0].description}">
    <p>${d.main.temp}°C • ${d.weather[0].description}</p>
    <p>Humidity: ${d.main.humidity}% | Wind: ${d.wind.speed} m/s</p>
  `;
  show(currentBox);
}

// Details
function renderDetails(d) {
  detailsBox.innerHTML = `
    <div class="weather-detail-card"><i class="fas fa-water"></i><p>${d.main.humidity}%</p><span>Humidity</span></div>
    <div class="weather-detail-card"><i class="fas fa-wind"></i><p>${d.wind.speed} m/s</p><span>Wind</span></div>
    <div class="weather-detail-card"><i class="fas fa-temperature-high"></i><p>${d.main.feels_like}°C</p><span>Feels Like</span></div>
  `;
  show(detailsBox);
}

// Forecast
function renderForecast(list) {
  forecastBox.innerHTML = "";
  const daily = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date] && item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });

  Object.values(daily).slice(0,5).forEach(day => {
    forecastBox.innerHTML += `
      <div class="card">
        <h4>${new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="">
        <p>${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  });
  show(forecastBox);
}

// Map
function renderMap(lat, lon) {
  const mapContainer = $("#map-container");
  const mapFrame = $("#location-map");
  mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&z=12&output=embed`;
  show(mapContainer);
}

// Geolocation
useLocationBtn.onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      getWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    }, () => getWeather("Delhi"));
  }
};

// Events
searchBtn.onclick = () => {
  const city = searchInput.value.trim();
  if (city) getWeather(city);
};
searchInput.addEventListener("keypress", e => { if(e.key==="Enter") searchBtn.click(); });
toggleBtn.onclick = () => document.body.classList.toggle("dark");

// Initial
window.addEventListener("load", () => show(welcomeMsg));
