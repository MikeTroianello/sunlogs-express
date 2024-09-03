const axios = require('axios');

const getLatAndLon = async (ip) => {
  const address = await axios.get(
    `http://api.ipstack.com/${ip}?access_key=${process.env.IPACCESSKEY}&format=1`
  );

  const { data } = address;
  const { latitude, longitude } = data || {};

  return { latitude, longitude };
};

module.exports = { getLatAndLon };
