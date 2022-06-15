"use strict";

import axios from "axios";
import * as images from "../public/images/assets/*.jpg";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const main: HTMLElement = document.querySelector(".main");
const boxHero: HTMLDivElement = document.querySelector(".box--hero");
// Labels
const labelTitle: HTMLLabelElement =
  document.querySelector(".box__label--title");
const labelTemp: HTMLLabelElement = document.querySelector(
  ".box__item-label--unit--temp"
);
const labelSpeed: HTMLLabelElement = document.querySelector(
  ".box__item-label--unit--speed"
);
// Images
const imgIcon: HTMLImageElement = document.querySelector(".box__item-img");
// Buttons
const btnUpdate: HTMLButtonElement = document.querySelector(
  ".head__item-btn--update"
);

////////////////////////////////////////////////
////// Interfaces and Type Aliases
///////////////////////////////////////////////

type WeatherTypes = "clear" | "haze" | "rain" | "snow" | "storm";
type WeatherIcons = `${"01" | "04" | "10" | "11" | "13"}d`;
type WeatherThemes = "orange" | "purple" | "blue";

interface Weather {
  temperature: string;
  weathercode: number;
  windspeed: string;
}

////////////////////////////////////////////////
////// App Logic
///////////////////////////////////////////////

// Helper function
function getLocation() {
  return new Promise<GeolocationCoordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (err) => reject(err)
    );
  });
}

async function updateWeather() {
  boxHero.classList.add("hidden");
  const { latitude: lat, longitude: lon } = await getLocation();
  axios
    .get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    .then((res) => {
      const weatherObj: Weather = res.data.current_weather;
      renderWeather(weatherObj);
      boxHero.classList.remove("hidden");
    })
    .catch((err) => console.error(err.message));
}

function renderWeather(weather: Weather) {
  let weatherType: WeatherTypes,
    weatherIcon: WeatherIcons,
    weatherTheme: WeatherThemes;
  const { temperature: temp, weathercode: code, windspeed: speed } = weather;
  // Set weather type, icon, and theme
  if (code >= 0 && code < 44) {
    // Clear day
    weatherType = "clear";
    weatherIcon = "01d";
    weatherTheme = "orange";
  } else if (code >= 44 && code < 61) {
    // Haze day
    weatherType = "haze";
    weatherIcon = "04d";
    weatherTheme = "purple";
  } else if (code >= 61 && code < 71) {
    // Rainy day
    weatherType = "rain";
    weatherIcon = "10d";
    weatherTheme = "purple";
  } else if (code >= 71 && code < 95) {
    // Snowy day
    weatherType = "snow";
    weatherIcon = "13d";
    weatherTheme = "blue";
  } else if (code >= 95 && code < 99) {
    // Stormy day
    weatherType = "storm";
    weatherIcon = "11d";
    weatherTheme = "blue";
  }
  // Load background image
  main.style.backgroundImage = `url("${images[weatherType]}")`;
  // Load theme background
  boxHero.classList.add(`box--theme--${weatherTheme}`);
  // Load weather icon
  const imgPath = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
  imgIcon.src = imgPath;
  imgIcon.addEventListener("load", () => {
    labelTitle.textContent = weatherType;
    labelTemp.textContent = `${temp}°C`;
    labelSpeed.textContent = `${speed}km/h`;
  });
}

function init() {
  btnUpdate.addEventListener("click", updateWeather);
}

init();
