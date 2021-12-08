"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerMain = document.querySelector(".main");
const containerHero = document.querySelector(".main__head");
const containerLoad = document.querySelector(".load");
// Buttons
const btnUpdateWeather = document.querySelector(".head .nav__btn");
// Inputs
const progressBar = document.querySelector(".load__bar");
// Labels
const labelLoadDesc = document.querySelector(".load__label--desc");
const labelWeatherTitle = document.querySelector(".hero__label--title");
const labelWeatherDesc = document.querySelector(".hero__label--desc");
const labelWeatherTemp = document.querySelector(".hero__label--temp");
const labelWeatherHumidity = document.querySelector(".hero__label--humidity");
// Images
const imgWeatherIcon = document.querySelector(".main .hero__img");

////////////////////////////////////////////////
////// App Architecture
///////////////////////////////////////////////

class App {
  constructor() {
    btnUpdateWeather.addEventListener(
      "click",
      this._retrieveWeatherData.bind(this)
    );
  }

  _updateProgressBar(val) {
    let txt;
    progressBar.value = val;
    switch (val) {
      case 20:
        txt = "Fetching user location";
        break;
      case 50:
        txt = "Gathering locale weather updates";
        break;
      case 99:
        txt = "Rendering weather data";
        break;
    }
    labelLoadDesc.textContent = `${txt}...`;
  }

  _getPosition() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async _retrieveWeatherData() {
    try {
      const wait = (secs) =>
        new Promise((resolve) => setTimeout(resolve, secs * 1000));
      containerHero.classList.add("hidden");
      containerLoad.classList.remove("hidden");
      const pos = await this._getPosition();
      const { latitude: lat, longitude: lon } = pos.coords;
      this._updateProgressBar(20);
      await wait(1);
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (!geoRes.ok) throw new Error("Problem with geocoding");
      this._updateProgressBar(50);
      await wait(1);
      const geoData = await geoRes.json();
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${geoData.city}&units=metric&appid={YOURKEY}}`
      );
      if (!weatherRes.ok) throw new Error("Failed to retrieve weather data");
      this._updateProgressBar(99);
      await wait(1);
      containerLoad.classList.add("hidden");
      const weatherData = await weatherRes.json();
      this._renderWeather(weatherData);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  _renderWeather(data) {
    let imgName;
    const { temp, humidity } = data.main;
    const [weather] = data.weather;
    const { main: title, description: desc } = weather;
    switch (title.toLowerCase()) {
      case "clouds":
        imgName = "clouds";
        break;
      case "rain":
        imgName = "rain";
        break;
      case "sunny":
        imgName = "sunny";
        break;
    }
    containerMain.style.backgroundImage = `url(/assets/images/${imgName}.jpg)`;
    const imgPath = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    imgWeatherIcon.src = imgPath;
    imgWeatherIcon.addEventListener("load", function () {
      containerHero.classList.remove("hidden");
      labelWeatherTitle.textContent = title;
      labelWeatherTemp.textContent = `${temp}°`;
      labelWeatherHumidity.textContent = `${humidity}%`;
      labelWeatherDesc.textContent = desc;
    });
  }
}

const app = new App();
