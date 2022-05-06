"use strict";

import "core-js/stable";
import "regenerator-runtime";

import * as images from "../public/images/assets/*.jpg";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const main = document.querySelector(".main");
const boxHero = document.querySelector(".box--hero");
// Labels
const labelTitle = document.querySelector(".box__label--title");
const labelTemp = document.querySelector(".box__item-label--unit--temp");
const labelSpeed = document.querySelector(".box__item-label--unit--speed");
// Images
const imgIcon = document.querySelector(".box__item-img");
// Buttons
const btnUpdate = document.querySelector(".head__item-btn--update");

// Helper function
function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function updateWeather() {
  try {
    boxHero.classList.add("hidden");
    const pos = await getPosition();
    const { latitude: lat, longitude: lon } = pos.coords;
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!weatherRes.ok) throw new Error("Failed to retrieve weather data");
    const weatherData = await weatherRes.json();
    renderWeather(weatherData);
    boxHero.classList.remove("hidden");
  } catch (err) {
    console.error(err.message);
  }
}

function renderWeather(data) {
  let typeWeather, iconWeather, themeWeather;
  const {
    temperature: temp,
    weathercode: code,
    windspeed: speed,
  } = data.current_weather;
  // Set weather type name
  if (code >= 0 && code < 44) typeWeather = "clear";
  if (code >= 44 && code < 61) typeWeather = "haze";
  if (code >= 61 && code < 71) typeWeather = "rain";
  if (code >= 71 && code < 95) typeWeather = "snow";
  if (code >= 95 && code < 99) typeWeather = "storm";
  // Set weather icon name
  switch (typeWeather) {
    case "clear":
      iconWeather = "01d";
      break;
    case "haze":
      iconWeather = "04d";
      break;
    case "rain":
      iconWeather = "10d";
      break;
    case "snow":
      iconWeather = "13d";
      break;
    case "storm":
      iconWeather = "11d";
      break;
  }
  if (typeWeather === "clear") themeWeather = "orange";
  if (typeWeather === "haze" || typeWeather === "rain") themeWeather = "purple";
  if (typeWeather === "snow" || typeWeather === "storm") themeWeather = "blue";
  // Load background image
  main.style.backgroundImage = `url("${images[typeWeather]}")`;
  // Load theme background
  boxHero.classList.add(`box--theme--${themeWeather}`);
  // Load weather icon
  const imgPath = `https://openweathermap.org/img/wn/${iconWeather}@2x.png`;
  imgIcon.src = imgPath;
  imgIcon.addEventListener("load", function () {
    labelTitle.textContent = typeWeather;
    labelTemp.textContent = `${temp}°C`;
    labelSpeed.textContent = `${speed}km/h`;
  });
}

function init() {
  btnUpdate.addEventListener("click", updateWeather);
}

init();
