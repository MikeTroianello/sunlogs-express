const axios = require('axios');

const getAddressInfo = async ({ latitude, longitude }) => {
  let fullAddress = await axios.get(
    `https://secure.geonames.org/findNearestAddressJSON?lat=${latitude}&lng=${longitude}&username=${process.env.GEO_NAME}`
  );

  const { data: addressData } = fullAddress || {};
  const { address: addressInfo } = addressData || {};
  const { adminName1: state, adminName2: county } = addressInfo || {};

  return {
    county,
    state,
  };
};

module.exports = { getAddressInfo };
