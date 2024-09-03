const { getLatAndLon } = require('./getLatAndLon');
const { getAddressInfo } = require('./getAddressInfo');
const { getWeatherInfo } = require('./getWeatherInfo');

const getAddressAndWeatherInfo = async (ip) => {
  const latAndLon = await getLatAndLon(ip);

  const { state, county } = await getAddressInfo(latAndLon);

  const { weatherCode, weatherIcon, weatherType } = await getWeatherInfo(
    latAndLon
  );

  return {
    state,
    county,
    weatherCode,
    weatherIcon,
    weatherType,
  };
};

module.exports = { getAddressAndWeatherInfo };
