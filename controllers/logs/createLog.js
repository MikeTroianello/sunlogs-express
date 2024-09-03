require('dotenv').config();
const Log = require('../../models/Log');
const chalk = require('chalk');
const {
  getAddressAndWeatherInfo,
} = require('../../utils/getAddressAndWeatherInfo');

//POST Create a Log
const createLog = async (req, res) => {
  try {
    const { body, user } = req || {};

    const { info } = body || {};
    const { id: creatorId } = user || {};

    // var ip = req.header("x-forwarded-for") || req.ip;
    // if (!ip) ip = "100.44.178.190";
    let ip = '100.44.178.190';

    const { state, county, weatherCode, weatherIcon, weatherType } =
      await getAddressAndWeatherInfo(ip);

    var now = new Date();

    const log = {
      ...info,
      date: now,
      weatherType,
      weatherCode,
      weatherIcon,
      creatorId,
      county,
      state,
    };

    const createdLog = await Log.create(log);
    //TODO: add to JWT
    req.user.createdToday = true;
    const infoToSendBack = { createdLog, user: req.user };
    res.json(infoToSendBack);
  } catch (err) {
    console.log(chalk.red('Error', err));
    res.status(500).send(err);
  }
};

module.exports = { createLog };
