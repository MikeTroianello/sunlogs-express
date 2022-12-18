require("dotenv").config();

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Log = require("../models/Log");
const ensureLogin = require("connect-ensure-login");

const auth = require("../middleware/auth");
const getId = require("../middleware/getId");

const axios = require("axios");
const jwt = require("jsonwebtoken");

const chalk = require("chalk");

// GET See all logs from everyone
router.get("/all/everyone", async (req, res, nex) => {
  try {
    const allLogs = await Log.find();
    res.send(allLogs);
  } catch (err) {
    res.status(400).json(err);
  }
});

// GET See all logs from logged in User
router.get("/all/my-posts", auth, async (req, res, next) => {
  try {
    const userLogs = await Log.find({ creatorId: req.user.id });
    res.send(userLogs);
  } catch (err) {
    res.status(400).json(err);
  }
});

// GET See all logs from one user
router.get("/all/:id", (req, res, next) => {
  Log.find({ creatorId: req.params.id })
    .populate("creatorId")
    .then((userLogs) => {
      if (userLogs[0].creatorId.deleted) {
        res.json({ message: "This user has deleted their account" });
      } else if (userLogs[0].creatorId.hideProfile) {
        res.json({
          message: "This user has decided to keep their profile hidden",
        });
      } else {
        const creator = {
          username: userLogs[0].creatorId.username,
          gender: userLogs[0].creatorId.gender,
        };

        let logsToSend = userLogs.filter((log) => {
          log.creatorId = creator;
          if (log.privateJournal) {
            log.journal = `${log.creatorId.username} has chosen to keep this log hidden`;
          }
          if (log.hideCreator) {
            console.log("CREATOR IS HIDDEN", log);
          }
          return !log.hideCreator;
        });
        res.send(logsToSend);
      }
    })
    .catch((err) => {
      next(err);
    });
});

//GET See all posts from one area
router.get("/region/:county", async (req, res) => {
  try {
    const countyLogs = await Log.find({ county: req.params.county });
    res.send(countyLogs);
  } catch (err) {
    res.status(400).json(err);
  }
});

//GET See all posts from a certain date
router.get("/date/:year/:day", (req, res, next) => {
  Log.find({ dayOfYear: req.params.day })
    .populate("creatorId")
    .then((dayLogs) => {
      let yours = false;
      let specificDay = dayLogs.filter((log) => {
        if (req.user && req.user.id == log.creatorId._id) {
          yours = true;
          if (log.privateJournal) {
            log.madePrivate = true;
          }
        } else if (log.privateJournal) {
          log.journal = "This log is set to private";
        } else if (log.creatorId.deleted) {
          log.journal = "This user has deleted their account";
        }

        //THIS MAKES THE CREATOR'S NAME HIDDEN TO ALL EXCEPT THE CREATOR

        if (
          (log.hideCreator == true &&
            req.user &&
            req.user.id != log.creatorId.id) ||
          (log.hideCreator == true && !req.user)
        ) {
          let hiddenCreator = {
            username: "This user has decided to keep their name private",
            gender: log.creatorId.gender,
          };
          log.creatorId = hiddenCreator;
        } else if (log.creatorId.deleted) {
          let hiddenCreator = {
            username: "Deleted",
            gender: log.creatorId.gender,
          };
          log.creatorId = hiddenCreator;
        }
        return log.year == req.params.year;
      });
      let id;
      !req.user ? (id = null) : (id = req.user.id);
      let dayOfYear = { specificDay, yours, id };
      res.json(dayOfYear);
    })
    .catch((err) => {
      next(err);
    });
});

// GET see individual log
//Come back to this later and make this have some properties if the user clicks their own post
router.get("/view/:logId", async (req, res) => {
  const foundLog = await Log.findById(req.params.logId);
  try {
    res.sendStatus(foundLog);
  } catch (err) {
    res.status(400).json(err);
  }
});

//GET create log
router.get("/create", auth, (req, res, next) => {
  res.render("logs/create");
});

//POST Create a Log

router.post("/create", auth, async (req, res, next) => {
  try {
    // const {
    //   mood,
    //   productivity,
    //   journal,
    //   privateJournal,
    //   hideCreator,
    //   year,
    //   dayOfWeek,
    //   dayOfYear,
    //   dayOfMonth,
    //   month,
    // } = req.body.info;

    const { info } = req.body;

    // var ip = req.header("x-forwarded-for") || req.ip;
    // console.log(chalk.blue("IP", req.ip));
    // if (!ip) ip = "100.44.178.190";
    let ip = "100.44.178.190";
    // let ip = "2600:1700:3b0:4040:1e95:2bef:cbd9:89b3";

    const address = await axios.get(
      `http://api.ipstack.com/${ip}?access_key=${process.env.IPACCESSKEY}&format=1`
    );

    console.log(
      `http://api.ipstack.com/${ip}?access_key=${process.env.IPACCESSKEY}&format=1`
    );

    // let latitude = address?.data?.latitude;
    // let longitude = address?.data?.longitude;

    const { data } = address;
    const { latitude, longitude } = data || {};

    let fullAddress = await axios.get(
      `https://secure.geonames.org/findNearestAddressJSON?lat=${latitude}&lng=${longitude}&username=${process.env.GEO_NAME}`
    );

    let weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=e2b615c3bb5026ab6b4565b64886ff5b`
    );

    const weatherStuff = {
      type: weather.data.weather[0].main,
      code: weather.data.weather[0].id,
      icon: weather.data.weather[0].icon,
    };

    const weatherType = weatherStuff.type;
    const weatherCode = weatherStuff.code;
    const weatherIcon = weatherStuff.icon;

    var now = new Date();

    let a = now.toString().split(" ");

    // const log = {
    //   mood,
    //   productivity,
    //   journal,
    //   privateJournal,
    //   hideCreator,
    //   dayOfWeek,
    //   month,
    //   dayOfMonth,
    //   dayOfYear,
    //   year,
    //   latitude,
    //   longitude,
    //   weatherType,
    //   weatherCode,
    //   weatherIcon,
    //   creatorId: req.user.id,
    //   county: fullAddress.data.address.adminName2,
    //   state: fullAddress.data.address.adminName1,
    // };

    const log = {
      ...info,
      weatherType,
      weatherCode,
      weatherIcon,
      creatorId: req.user.id,
      county: fullAddress.data.address.adminName2,
      state: fullAddress.data.address.adminName1,
    };

    const createdLog = await Log.create(log);
    //TODO: add to JWT
    req.user.createdToday = true;
    const infoToSendBack = { createdLog, user: req.user };
    res.json(infoToSendBack);
  } catch (err) {
    console.log(chalk.red("Error", err));
    res.status(500).send(err);
  }
});

router.post("/create-mobile", async (req, res, next) => {
  try {
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
        location,
      } = req.body;

      let { latitude, longitude } = location.coords;

      let fullAddress = await axios.get(
        `https://secure.geonames.org/findNearestAddressJSON?lat=${latitude}&lng=${longitude}&username=${process.env.GEO_NAME}`
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
        creatorId: req.user._id,
        dayOfWeek: dayOfWeek,
        month: month,
        dayOfMonth: dayOfMonth,
        dayOfYear: dayOfYear,
        year: year,
      };

      const createdLog = await Log.create(log);

      req.user.createdToday = true;
      const infoToSendBack = { createdLog, user: req.user };

      res.json(infoToSendBack);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
