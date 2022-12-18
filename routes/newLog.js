require("dotenv").config();

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Log = require("../models/Log");
const ensureLogin = require("connect-ensure-login");

const axios = require("axios");

router.post("/create", async (req, res, next) => {
  if (req.isAuthenticated()) {
    const {
      mood,
      productivity,
      journal,
      privateJournal,
      hideCreator,
      year,
      dayOfWeek,
      dayOfYear,
      dayOfMonth,
      month,
    } = req.body.info;

    // var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    let latitude;
    let longitude;

    const address = await axios.get(
      `http://api.ipstack.com/${ip}?access_key=${process.env.IPACCESSKEY}&format=1`
    );

    latitude = address.data.latitude;
    longitude = address.data.longitude;

    let fullAddress = await axios.get(
      `http://api.geonames.org/findNearestAddressJSON?lat=${latitude}&lng=${longitude}&username=${process.env.GEO_NAME}`
    );

    let weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_KEY}`
    );

    console.log(weather.data.weather[0].main);
    const weatherStuff = {
      type: weather.data.weather[0].main,
      code: weather.data.weather[0].id,
      icon: weather.data.weather[0].icon,
    };

    countAddress(weatherStuff);

    const weatherType = weatherStuff.type;
    const weatherCode = weatherStuff.code;
    const weatherIcon = weatherStuff.icon;

    var now = new Date();

    let a = now.toString().split(" ");

    const log = {
      mood: mood,
      productivity: productivity,
      weatherType: weatherType,
      weatherCode: weatherCode,
      weatherIcon: weatherIcon,
      journal: journal,
      privateJournal: privateJournal,
      latitude: latitude,
      longitude: longitude,
      county: fullAddress.data.address.adminName2,
      state: fullAddress.data.address.adminName1,
      hideCreator: hideCreator,
      creatorId: req.user.id,
      dayOfWeek: dayOfWeek,
      month: month,
      dayOfMonth: dayOfMonth,
      dayOfYear: dayOfYear,
      year: year,
    };

    Log.create(log)
      .then((createdLog) => {
        req.user.createdToday = true;
        const infoToSendBack = { createdLog, user: req.user };

        res.json(infoToSendBack);
      })
      .catch((err) => {
        res.send(err);
      });
  }
});

module.exports = router;
