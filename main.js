const cityData = {};

const renderCityData = function () {
  $('.city-current').empty();

  const source = $('#city-template').html();
  const template = Handlebars.compile(source);
  const newHTML = template(cityData);

  $('.city-current').append(newHTML);
};

const renderForecastData = function () {
  $('.city-forecast').empty();

  const source = $('#forecast-template').html();
  const template = Handlebars.compile(source);

  for (let i = 0; i < cityData.forecast.length; i += 1) {
    const newHTML = template(cityData.forecast[i]);
    $('.city-forecast').append(newHTML);
  }
};

const gatherLocationData = function (data) {
  if (data[0].country === 'US') {
    cityData.country = data[0].state;
  } else {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    cityData.country = regionNames.of(data[0].country);
  }

  cityData.name = data[0].name;
  cityData.lat = data[0].lat;
  cityData.lon = data[0].lon;
};

const gatherWeatherData = function (currentWeatherData) {
  cityData.current = Math.round(currentWeatherData.main.temp);
  cityData.icon = currentWeatherData.weather[0].icon;

  const descriptionArr = currentWeatherData.weather[0].description.split(' ');
  const description = descriptionArr
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(' ');
  cityData.description = description;
};

const gatherForecastData = function (forecastData) {
  cityData.forecast = [];
  console.log(forecastData);
  for (let i = 5; i < forecastData.list.length; i += 8) {
    const eachForecast = {};

    const date = new Date(forecastData.list[i].dt_txt).toLocaleDateString(
      'en-US',
      { weekday: 'long' }
    );

    eachForecast.date = date;
    eachForecast.high = Math.round(forecastData.list[i].main.temp_max);
    eachForecast.description = forecastData.list[i].weather[0].main;
    eachForecast.icon = forecastData.list[i].weather[0].icon;

    cityData.forecast.push(eachForecast);
    console.log(`List #${i}, Date is ${forecastData.list[i].dt_txt}`);
  }

  renderCityData();

  renderForecastData();
};

const fetch = function (query) {
  $.ajax({
    method: 'GET',
    url: `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=4da99895dae25ae39743d1996fb14942`,
    dataType: 'json',
    error(jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
    },
  })
    .then((data) => {
      gatherLocationData(data);

      return $.ajax({
        method: 'GET',
        url: `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=4da99895dae25ae39743d1996fb14942&units=imperial`,
        dataType: 'json',
        error(jqXHR, textStatus, errorThrown) {
          console.log(textStatus);
        },
      });
    })
    .done((currentWeatherData) => {
      gatherWeatherData(currentWeatherData);

      return $.ajax({
        method: 'GET',
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.lat}&lon=${cityData.lon}&appid=4da99895dae25ae39743d1996fb14942&units=imperial`,
        dataType: 'json',
        success(forecastData) {
          gatherForecastData(forecastData);
        },
        error(jqXHR, textStatus, errorThrown) {
          console.log(textStatus);
        },
      });
    });
};

const searchValueTrimmer = (query) => {
  const queryArr = query.split(',');
  const queryTrimmedArr = queryArr.map((index) => index.trim());
  const finalQuery = queryTrimmedArr.join(',');
  return finalQuery;
};

$('.search').on('click', () => {
  const search = $('#search-query').val();
  const searchTrimmed = searchValueTrimmer(search);

  fetch(searchTrimmed);

  $('#search-query').val('');
});

$('input').on('keypress', (e) => {
  const keycode = e.keyCode ? e.keyCode : e.which;
  if (keycode === 13) {
    e.preventDefault();
    const search = $('#search-query').val();
    const searchTrimmed = searchValueTrimmer(search);

    fetch(searchTrimmed);

    $('#search-query').val('');
  }
});
