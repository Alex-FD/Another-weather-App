document.addEventListener("DOMContentLoaded", function() {
  const URL = "http://api.openweathermap.org/data/2.5/weather?";
  const APPID = "1be4f38ab943b366bfbf42919abf5ba5"; //Enter your APPID here

  let app = {
    isActive: false,
    init: function() {
      this.isActive = true;
      let clsBtn = getElement("degree-box__btn_left", "class", 0);
      let input = getElement("search-form__input", "class", 0);
      showElements();
      setBaseBladeRotationTime(3.125);
      clsBtn.classList.add("active");
      input.value = "";
    },
    convertDegrees: function() {
      let degBtn = getElement("degree-box__btn", "class");
      let param = getElement("deg", "id");
      let btnArr = Array.prototype.slice.call(degBtn);
      btnArr.forEach(function(btn) {
        btn.onclick = function() {
          if (this.classList.contains("active")) {
            return false;
          } else if (this.getAttribute("id") === "celsius") {
            let deg = param.textContent;
            this.classList.add("active");
            this.nextElementSibling.classList.remove("active");
            param.textContent = convertToCelsius(deg);
          } else if (this.getAttribute("id") === "fahrenheit") {
            let deg = param.textContent;
            this.classList.add("active");
            this.previousElementSibling.classList.remove("active");
            param.textContent = convertToFahrenheit(deg);
          }
        };
      });
    },
    focusInput: function() {
      let input = getElement("search-form__input", "class", 0);
      let placeHolder = input.placeholder;
      input.onfocus = function() {
        this.placeholder = "";
        this.value = null;
        if (this.parentElement.classList.contains("error")) {
          this.parentElement.classList.remove("error");
          this.classList.remove("error");
        }
      };
      input.onblur = function() {
        this.placeholder = placeHolder;
      };
    },
    getCurrentPos: function() {
      let currentLocationBtn = getElement("fa-location-arrow", "class", 0);
      currentLocationBtn.addEventListener("click", getNavigationData);
    },
    getWeatherData: function() {
      let searchBtn = getElement("search-form__button", "class", 0);
      searchBtn.addEventListener("click", requestData);
    }
  };

  function requestData() {
    let clsBtn = getElement("degree-box__btn_left", "class", 0);
    let fahrBtn = getElement("degree-box__btn_right", "class", 0);
    let cityName = getElement("search-form__input", "class", 0).value;
    let params = {
      city: cityName,
      lang: "ru",
      units: "metric",
      APPID: APPID
    };
    let method = "GET";
    let url = URL + createQuery(params);
    let xhr = new XMLHttpRequest();
    clearIconClass(); /*TODO where in the code should this function be?*/
    setBaseBladeRotationTime(3.125);
    xhr.open(method, url, true);

    if (!cityName) {
      showErrorAlert();
    } else {
      xhr.send();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let jsonObj = JSON.parse(xhr.responseText);
          clsBtn.classList.add("active");
          fahrBtn.classList.remove("active");
          console.log(jsonObj);
          displayData(jsonObj);
          console.log("Request done successfully.");
          console.log("Status: " + xhr.status);
        } else if (xhr.readyState === 4 && xhr.status === 404) {
          getElement("wi", "class", 0).classList.add("wi-na");
          getElement("deg", "id").textContent = 0;
          console.log("There was a problem fetching data.");
          console.log("Status:" + xhr.status);
          console.log("Error:" + xhr.statusText);
        } else if (xhr.readyState === 4 && xhr.status === 400) {
          getElement("wi", "class", 0).classList.add("wi-alien");
          getElement("deg", "id").textContent = 0;
          console.log(
            "The request is invalid."
          ); /*TODO show some message to signal that city name is incorrect."*/
          console.log("Status: " + xhr.status);
          console.log("Error: " + xhr.statusText);
        }
      };
    }
  }
  function displayData(data) {
    let weatherForecast = {
      temp: data.main.temp,
      description: data.weather[0].description,
      wind: [{ speed: data.wind.speed }, { direction: data.wind.deg }],
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      cloudiness: data.clouds.all,
      icon: data.weather[0].icon,
      ID: data.weather[0].id
    };
    setIconCode(weatherForecast);
    setTemperature(weatherForecast);
    setCloudiness(weatherForecast);
    setDescription(weatherForecast);
    setHumidity(weatherForecast);
    setPressure(weatherForecast);
    setWindDirection(weatherForecast);
    setWindSpeed(weatherForecast);
    setWindStrength(weatherForecast);
    setBladeRotationTime(weatherForecast);
  }
  function getNavigationData() {
    let currPosTxt = getElement("current-pos__text", "class", 0);
    function getLocation() {
      let options = {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 0
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          getPosition,
          showError,
          options
        );
      } else {
        currPosTxt.textContent =
          "Функция геолокации не поддерживатся браузером.";
      }
    }
    getLocation();
    function displayLocation(data) {
      let input = getElement("search-form__input", "class", 0);
      input.value = data.name;
    }
    function showError(error) {
      switch (error.code) {
        case error.POSITION_UNAVAILABLE:
          currPosTxt.textContent = "Информация о геолокации недоступна.";
          break;
        case error.TIMEOUT:
          currPosTxt.textContent =
            "Время ожидания информации о геолокации пользователя истекло.";
          break;
      }
    }
    function getPosition(navObject) {
      let coordObj = {
        lon: navObject.coords.longitude,
        lat: navObject.coords.latitude,
        accuracy: navObject.coords.accuracy,
        altitude: navObject.altitude,
        heading: navObject.heading
      };
      let params = {
        lat: coordObj.lat,
        lon: coordObj.lon,
        units: "metric",
        lang: "ru",
        APPID: APPID
      };
      let method = "GET";
      let url = URL + createQuery(params);
      console.log(coordObj);
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.send();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let jsonObj = JSON.parse(xhr.responseText);
          displayLocation(jsonObj);
          console.log("Request done successfully.");
          console.log("Status: " + xhr.status);
        }
      };
    }
  }
  function showErrorAlert() {
    let input = getElement("search-form__input", "class", 0);
    input.parentElement.classList.add("error");
    input.classList.add("error");
    input.placeholder = "Введите название города!";
  }
  function setIconCode(obj) {
    let icon = getElement("wi-des", "class", 0);
    if (obj.icon === undefined) {
      icon.classList.add("wi-na");
    } else if (obj.icon.indexOf("n") !== -1) {
      icon.classList.add("wi", "wi-owm-night-" + obj.ID);
      document.body.classList.remove("day");
      document.body.classList.add("night");
    } else if (obj.icon.indexOf("d") !== -1) {
      icon.classList.add("wi", "wi-owm-day-" + obj.ID);
      document.body.classList.add("day");
      document.body.classList.remove("night");
    }
  }
  function setHumidity(obj) {
    let humidity = getElement("footer__text_figures", "class", 3);
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.humidity === undefined) {
      humidity.innerHTML = "";
      humidity.appendChild(na);
    } else {
      humidity.textContent = obj.humidity + "%";
    }
  }
  function setTemperature(obj) {
    let temp = getElement("deg", "id");
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.temp === undefined) {
      temp.innerHTML = "";
      temp.appendChild(na);
    } else {
      temp.textContent = Math.round(Number(obj.temp));
    }
  }
  function setCloudiness(obj) {
    let cloudiness = getElement("footer__text_figures", "class", 4);
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.cloudiness === undefined) {
      cloudiness.innerHTML = "";
      cloudiness.appendChild(na);
    } else {
      cloudiness.textContent = obj.cloudiness + "%";
    }
  }
  function setDescription(obj) {
    let description = getElement("description", "id");
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.description === undefined) {
      description.innerHTML = "";
      description.appendChild(na);
    } else {
      description.textContent = obj.description;
    }
  }
  function setWindDirection(obj) {
    let direction = getElement("wi-dir", "class", 0);

    if (obj.wind[1].direction === undefined) {
      direction.classList.remove("wi-wind");
      direction.classList.add("wi-na");
      direction.style.mozTransform = "none";
      direction.style.msTransform = "none";
      direction.style.oTransform = "none";
      direction.style.transform = "none";
    } else {
      direction.classList.remove("wi-na");
      direction.classList.add("wi-wind");
      direction.style.mozTransform =
        "rotate(" + obj.wind[1].direction.toFixed(0) + "deg" + ")";
      direction.style.msTransform =
        "rotate(" + obj.wind[1].direction.toFixed(0) + "deg" + ")";
      direction.style.oTransform =
        "rotate(" + obj.wind[1].direction.toFixed(0) + "deg" + ")";
      direction.style.transform =
        "rotate(" + obj.wind[1].direction.toFixed(0) + "deg" + ")";
    }
  }
  function setBladeRotationTime(obj) {
    let blade = getElement("blade", "class", 0);
    let bladeRotationTime = parseFloat(
      window.getComputedStyle(blade).getPropertyValue("animation-duration")
    );
    let coeff = defineReductionFactor(obj.wind[0].speed.toFixed(1)).toFixed(3);
    blade.style.WebkitAnimationDuration = bladeRotationTime / coeff + "s";
    blade.style.animationDuration = bladeRotationTime / coeff + "s";
  }

  function setBaseBladeRotationTime(time) {
    let blade = getElement("blade", "class", 0);
    let bladeRotationTime = Number(time);
    blade.style.WebkitAnimationDuration = bladeRotationTime + "s";
    blade.style.animationDuration = bladeRotationTime + "s";
  }
  function setWindSpeed(obj) {
    let speed = getElement("footer__text_figures", "class", 0);
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.wind[0].speed === undefined) {
      speed.innerHTML = "";
      speed.appendChild(na);
    } else {
      speed.textContent =
        obj.wind[0].speed.toFixed(1) +
        " м/с" +
        ", " +
        defineWindDirection(obj.wind[1].direction.toFixed(0));
    }
  }
  function setPressure(obj) {
    let pressure = getElement("footer__text_figures", "class", 2);
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.pressure === undefined) {
      pressure.innerHTML = "";
      pressure.appendChild(na);
    } else {
      pressure.textContent =
        convertPressure(obj.pressure).toFixed(0) + " мм рт.ст.";
    }
  }
  function setWindStrength(obj) {
    let strength = getElement("footer__text_figures", "class", 1);
    let na = document.createElement("i");
    na.classList.add("wi", "wi-na");

    if (obj.wind[0].speed === undefined) {
      strength.innerHTML = "";
      strength.appendChild(na);
    } else {
      strength.textContent = defineWindStrength(obj.wind[0].speed.toFixed(1));
    }
  }
  function clearIconClass() {
    getElement("wi-des", "class", 0).className = "wi wi-des";
  }
  function getElement(param, type, idx) {
    let elem;
    if (param !== undefined) {
      if (type === "id") {
        elem = document.getElementById(param);
      } else if (type === "class" && idx === undefined) {
        elem = document.getElementsByClassName(param);
      } else if (type === "class" && idx !== undefined) {
        elem = document.getElementsByClassName(param)[idx];
      }
    }
    return elem;
  }
  function convertToCelsius(deg) {
    return (((deg - 32) * 5) / 9).toFixed(0);
  }
  function convertToFahrenheit(deg) {
    return ((deg * 9) / 5 + 32).toFixed(0);
  }
  function convertPressure(pressure) {
    return pressure / 1.33322;
  }
  function defineWindDirection(deg) {
    switch (!isNaN(deg)) {
      case 0 <= deg && deg <= 11:
        return "северный";
      case 12 <= deg && deg <= 33:
        return "северный, северо-восточный";
      case 34 <= deg && deg <= 56:
        return "северо-восточный";
      case 57 <= deg && deg <= 78:
        return "восточный, северо-восточный";
      case 79 <= deg && deg <= 101:
        return "восточный";
      case 102 <= deg && deg <= 123:
        return "восточный, юго-восточный";
      case 124 <= deg && deg <= 146:
        return "юго-восточный";
      case 147 <= deg && deg <= 168:
        return "южный, юго-восточный";
      case 169 <= deg && deg <= 191:
        return "южный";
      case 192 <= deg && deg <= 213:
        return "южный, юго-западный";
      case 214 <= deg && deg <= 236:
        return "юго-западный";
      case 237 <= deg && deg <= 258:
        return "западный, юго-западный";
      case 259 <= deg && deg <= 281:
        return "западный";
      case 282 <= deg && deg <= 303:
        return "западный, северо-западный";
      case 304 <= deg && deg <= 326:
        return "северо-западный";
      case 327 <= deg && deg <= 348:
        return "северный, северо-западный";
      case 349 <= deg && deg <= 360:
        return "северный";
      default:
        return undefined;
    }
  }
  function defineWindStrength(speed) {
    switch (!isNaN(speed)) {
      case 0 <= speed && speed <= 0.2:
        return "штиль";
      case 0.3 <= speed && speed <= 1.5:
        return "тихий";
      case 1.6 <= speed && speed <= 3.3:
        return "легкий";
      case 3.4 <= speed && speed <= 5.4:
        return "слабый";
      case 5.5 <= speed && speed <= 7.9:
        return "умеренный";
      case 8 <= speed && speed <= 10.7:
        return "свежый";
      case 10.8 <= speed && speed <= 13.8:
        return "сильный";
      case 13.9 <= speed && speed <= 17.1:
        return "крепкий";
      case 17.2 <= speed && speed <= 20.7:
        return "очень крепкий";
      case 20.8 <= speed && speed <= 24.4:
        return "шторм";
      case 24.5 <= speed && speed <= 28.4:
        return "сильный шторм";
      case 28.5 <= speed && speed <= 32.6:
        return "жестокий шторм";
      case 33 < speed:
        return "ураган";
      // case speed === undefined:
      default:
        return undefined;
    }
  }
  function defineReductionFactor(speed) {
    switch (!isNaN(speed)) {
      case 0 <= speed && speed <= 0.2:
        return 0.2;
      case 0.3 <= speed && speed <= 1.5:
        return 1.5 - 0.3;
      case 1.6 <= speed && speed <= 3.3:
        return 3.3 - 1.6;
      case 3.4 <= speed && speed <= 5.4:
        return 5.4 - 3.4;
      case 5.5 <= speed && speed <= 7.9:
        return 7.9 - 5.5;
      case 8 <= speed && speed <= 10.7:
        return 10.7 - 8;
      case 10.8 <= speed && speed <= 13.8:
        return 13.8 - 10.8;
      case 13.9 <= speed && speed <= 17.1:
        return 17.1 - 13.9;
      case 17.2 <= speed && speed <= 20.7:
        return 20.7 - 17.2;
      case 20.8 <= speed && speed <= 24.4:
        return 24.4 - 20.8;
      case 24.5 <= speed && speed <= 28.4:
        return 28.4 - 24.5;
      case 28.5 <= speed && speed <= 32.6:
        return 32.6 - 28.5;
      case 33 < speed:
        return speed - 33;
      // case speed === undefined:
      default:
        return 1;
    }
  }
  function showElements() {
    let elements = getElement("description__elem", "class");
    let elemArr = Array.prototype.slice.call(elements);
    elemArr.forEach(function(elem) {
      elem.classList.add("active");
    });
  }
  function createQuery(paramObj) {
    let obj = paramObj;
    let queryArr = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "city") {
          let oldKey = key;
          key = "q";
          queryArr.push(key + "=" + obj[oldKey]);
        } else {
          queryArr.push(key + "=" + obj[key]);
        }
      }
    }
    return queryArr.join("&");
  }
  app.init();
  app.convertDegrees();
  app.focusInput();
  app.getWeatherData();
  app.getCurrentPos();
});
