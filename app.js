"use strict";

////////////////////////////////////////////////
////// Selecting HTML Elements
///////////////////////////////////////////////

// Parents
const containerHead = document.querySelector(".head");
const containerMain = document.querySelector(".main__content");
const containerHero = document.querySelector(".content__container--hero");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
// Buttons
const btnUpdate = containerHead.querySelector(".nav__btn--update");
const btnClose = modal.querySelector(".modal__btn--close");
// Inputs
const inputKey = modal.querySelector(".modal__input--key");
// Labels
const labelTitle = containerHero.querySelector(".container__label--title");
const labelDesc = containerHero.querySelector(".item__label--desc");
const labelTemp = containerHero.querySelector(".item__label--temp");
const labelHumidity = containerHero.querySelector(".item__label--humidity");
// Images
const imgIcon = containerHero.querySelector(".item__img");

////////////////////////////////////////////////
////// App Architecture
///////////////////////////////////////////////

class App {
  #key;

  constructor() {
    // Add event handlers
    btnUpdate.addEventListener("click", this._retrieveWeatherData.bind(this));
    btnClose.addEventListener("click", this._receiveKey.bind(this));
  }

  _receiveKey() {
    this.#key = inputKey?.value;
    if (!this.#key)
      return alert(
        "You must enter an API key in order to use this app. Please go to the README file of this repo to find out how"
      );
    if (!(this.#key.length === 32)) {
      inputKey.value = "";
      return alert("This key might be invalid. Please try again :)");
    }
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  _getPosition() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async _retrieveWeatherData() {
    try {
      if (!this.#key) return;
      containerHero.classList.add("hidden");
      const pos = await this._getPosition();
      const { latitude: lat, longitude: lon } = pos.coords;
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (!geoRes.ok) throw new Error("Problem with geocoding");
      const geoData = await geoRes.json();
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${
          geoData.city
        }&units=metric&appid=${this.#key}`
      );
      if (!weatherRes.ok) throw new Error("Failed to retrieve weather data");
      const weatherData = await weatherRes.json();
      this._renderWeather(weatherData);
    } catch (err) {
      console.error(err.message);
    }
  }

  _renderWeather(data) {
    const { temp, humidity } = data.main;
    const [weather] = data.weather;
    const { main: title, description: desc } = weather;
    const imgName = title.toLowerCase();
    containerMain.style.backgroundImage = `url(/assets/images/${imgName}.jpg)`;
    const imgPath = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    imgIcon.src = imgPath;
    imgIcon.addEventListener("load", function () {
      containerHero.classList.remove("hidden");
      labelTitle.textContent = title;
      labelTemp.textContent = `${temp}°`;
      labelHumidity.textContent = `${humidity}%`;
      labelDesc.textContent = desc;
    });
  }
}

const app = new App();
