'use strict';

// --------------------------------------------------------
// VARIABLES
// --------------------------------------------------------

// MOMENT
var dateToday = moment().format('MMMM Do YYYY');

// CHECKBOX: FAHRENHEIT VS. CELSIUS
var tempMetric = document.getElementById('flexSwitchCheckDefault');

// SEARCH FOR CITY
var btnMain = document.querySelectorAll('.btnMain');
var cityInput = document.querySelector('input');

// RECENT SEARCH
var recentSearchUL = document.getElementById('recentSearch');

// CITY ARRAY
var cityArray = [];

// API VARIABLES
var apiKey = 'd868554b03641dfa3c66c33e3bbd0080';
var forecastLiEl = document.querySelectorAll('li');
var focusCity = document.querySelector('h4');
var fiveDayDate = document.querySelectorAll('h5');
var fiveDaySection = document.querySelectorAll('section');

// ----------------------------------------------------------------------------------
// CLICK EVENT FOR SEARCH BUTTON
// ----------------------------------------------------------------------------------
for (let i = 0; i < btnMain.length; i++) {
  btnMain[i].addEventListener('click', function () {
    var cityText = toTitleCase(cityInput.value);
    var btnCheck = btnMain[i].innerHTML === 'Search';

    if (cityArray.includes(cityText) && btnCheck) {
      cityArray.splice(cityArray.indexOf(cityText), 1);
      cityArray.push(cityText);
      storeCities();
      cityInput.value = '';
      checkCity(cityArray[cityArray.length - 1]);
      renderCities();
    } else if (!cityArray.includes(cityText) && btnCheck) {
      cityArray.push(cityText);
      storeCities();
      cityInput.value = '';
      checkCity(cityArray[cityArray.length - 1]);
      renderCities();
    } else {
      localStorage.clear();
      location.reload();
    }
  });
}

// ----------------------------------------------------------------------------------
// GET CITY COORDS IF AVAILABLE | CHECK 1
// ----------------------------------------------------------------------------------

function checkCity(city) {
  var currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(currentWeatherApi).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        var lon = data.coord['lon'];
        var lat = data.coord['lat'];
        getForecast(lon, lat);
      });
    } else {
      alert(`🚫 ${cityArray[cityArray.length - 1]} is not a city`);
      cityInput.value = '';
      cityArray.pop();
      storeCities();
      renderCities();
      checkCity2(cityArray[cityArray.length - 1]);
    }
  });
}

// ----------------------------------------------------------------------------------
// GET CITY COORDS | RERUN | ONLY FOR WHEN CITY IS NOT AVAILABLE & LIST GETS UPDATED
// ----------------------------------------------------------------------------------

function checkCity2(city) {
  var currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(currentWeatherApi).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        var lon = data.coord['lon'];
        var lat = data.coord['lat'];
        getForecast(lon, lat);
      });
    }
  });
}

// ----------------------------------------------------------------------------------
// // GET CITY FORECAST
// ----------------------------------------------------------------------------------

function getForecast(lon, lat) {
  const metric = tempMetric.checked ? 'metric' : 'imperial';
  const metricDisplay = tempMetric.checked ? 'C' : 'F';
  const windSpeed = tempMetric.checked ? 'm/s' : 'mph';

  var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${metric}&exclude=minutely,hourly,alerts&appid=${apiKey}`;

  fetch(oneCallApi)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function (data) {
      if (recentSearchUL.children.length > 0) {
        focusCity.innerHTML = `<span class="focusCity">${cityArray[cityArray.length - 1]}: <span class="focusDate">${dateToday}</span></span>`;
        forecastLiEl[0].innerHTML = `Current Temperature: ${Math.round(data.current.temp)} &#176${metricDisplay}`;
        forecastLiEl[1].innerHTML = `Feels Like: ${Math.round(data.current.feels_like)} &#176${metricDisplay}`;
        forecastLiEl[2].innerHTML = `Condition: ${data.current.weather[0].main}`;
        forecastLiEl[3].innerHTML = `Humidity: ${data.current.humidity} &#37`;
        forecastLiEl[4].innerHTML = `High: ${Math.round(data.daily[0].temp.max)} &#176${metricDisplay}`;
        forecastLiEl[5].innerHTML = `Low: ${Math.round(data.daily[0].temp.min)} &#176${metricDisplay}`;
        forecastLiEl[6].innerHTML = `Wind Speed: ${data.current.wind_speed} ${windSpeed}`;
        forecastLiEl[7].innerHTML = `UV Index: ${data.current.uvi}`;
        for (let i = 0; i < fiveDayDate.length; i++) {
          fiveDaySection[i].children[0].innerHTML = moment()
            .add(i + 1, 'days')
            .format('M/D/YYYY');
          fiveDaySection[i].children[1].innerHTML = `Day: ${Math.round(data.daily[i].temp.day)} &#176${metricDisplay}`;
          fiveDaySection[i].children[2].innerHTML = `High: ${Math.round(data.daily[i].temp.max)} &#176${metricDisplay}`;
          fiveDaySection[i].children[3].innerHTML = `Low: ${Math.round(data.daily[i].temp.min)} &#176${metricDisplay}`;
          fiveDaySection[i].children[4].innerHTML = `Humidity: ${data.daily[i].humidity} &#37`;
        }
      }
    });
}

// ----------------------------------------------------------------------------------
// // STORE + LOAD LOCAL STORAGE CITIES
// ----------------------------------------------------------------------------------

function storeCities() {
  localStorage.setItem('cities', JSON.stringify(cityArray));
}

function renderCities() {
  cityArray = JSON.parse(localStorage.getItem('cities'));
  recentSearchUL.innerHTML = '';

  if (!cityArray) {
    cityArray = [];
    return false;
  } else {
    reduceList();
    checkCity2(cityArray[cityArray.length - 1]);
  }

  for (var i = 0; i < cityArray.length; i++) {
    var btnCityEl = document.createElement('button');
    btnCityEl.textContent = cityArray[i];
    btnCityEl.className = 'btn fs-4 d-flex flex-column ';
    recentSearchUL.prepend(btnCityEl);
  }
}

// ----------------------------------------------------------------------------------
// // CLICK EVENT | RECENT SEARCH LIST | UPDATE LIST
// ----------------------------------------------------------------------------------

recentSearchUL.addEventListener('click', function (e) {
  var cityClicked = e.target.innerHTML;
  cityArray.splice(cityArray.indexOf(cityClicked), 1);
  cityArray.push(cityClicked);
  storeCities();
  renderCities();
  checkCity(cityClicked);
});

// ----------------------------------------------------------------------------------
// FOR MAX 5 CITIES
// ----------------------------------------------------------------------------------
function reduceList() {
  if (cityArray.length > 5) {
    cityArray.splice(0, cityArray.length - 5);
    storeCities();
  }
}

// ----------------------------------------------------------------------------------
// PROPERCASE TEXT CONVERTER
// ----------------------------------------------------------------------------------
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

renderCities();
