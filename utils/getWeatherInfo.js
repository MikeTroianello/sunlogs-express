const axios = require('axios');

const getWeatherInfo = async ({ latitude, longitude }) => {
  let weather = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=e2b615c3bb5026ab6b4565b64886ff5b`
  );

  const { data: weatherData } = weather || {};
  const { weather: weatherArr } = weatherData || {};
  const [weatherInfo] = weatherArr || [];
  const {
    id: weatherCode,
    icon: weatherIcon,
    main: weatherType,
  } = weatherInfo || {};

  return {
    weatherCode,
    weatherIcon,
    weatherType,
  };
};

module.exports = { getWeatherInfo };
