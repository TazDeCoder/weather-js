"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerMain = document.querySelector(".main");
const containerHero = document.querySelector(".main__head");
// Buttons
const btnUpdateWeather = document.querySelector(".head .nav__btn");
// Labels
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

  _getPosition() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async _retrieveWeatherData() {
    try {
      const pos = await this._getPosition();
      const { latitude: lat, longitude: lon } = pos.coords;
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (!geoRes.ok) throw new Error("Problem with geocoding");
      const geoData = await geoRes.json();
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${geoData.city}&units=metric&appid={YOUR KEY}`
      );
      if (!weatherRes.ok) throw new Error("Failed to retrieve weather data");
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
