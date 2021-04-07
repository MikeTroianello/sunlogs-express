require('dotenv').config();

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Log = require('../models/Log');
const ensureLogin = require('connect-ensure-login');

const passport = require('passport');
const axios = require('axios');

// GET See all logs from everyone
router.get('/all/everyone', (req, res, nex) => {
  Log.find()
    .then(allLogs => {
      res.send(allLogs);
    })
    .catch(err => {
      next(err);
    });
});

// GET See all logs from logged in User
router.get('/all/my-posts', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log(req.user);
  console.log(req.user._id);
  Log.find({ creatorId: req.user._id })
    .then(userLogs => {
      console.log(userLogs);

      res.send(userLogs);
    })
    .catch(err => {
      next(err);
    });
});

// GET See all logs from one user
router.get('/all/:id', (req, res, next) => {
  // console.log('WE ARE LOOKING FOR A USER RIGHT NOW');
  Log.find({ creatorId: req.params.id })
    .populate('creatorId')
    .then(userLogs => {
      console.log(userLogs);
      if (userLogs[0].creatorId.deleted) {
        res.json({ message: 'This user has deleted their account' });
      } else if (userLogs[0].creatorId.hideProfile) {
        res.json({
          message: 'This user has decided to keep their profile hidden'
        });
      } else {
        const creator = {
          username: userLogs[0].creatorId.username,
          gender: userLogs[0].creatorId.gender
        };

        let logsToSend = userLogs.filter(log => {
          log.creatorId = creator;
          if (log.privateJournal) {
            log.journal = `${log.creatorId.username} has chosen to keep this log hidden`;
          }
          if (log.hideCreator) {
            console.log('CREATOR IS HIDDEN', log);
          }
          return !log.hideCreator;
        });
        res.send(logsToSend);
      }
    })
    .catch(err => {
      next(err);
    });
});

//GET See all posts from one area
router.get('/region/:county', (req, res, next) => {
  console.log(req.params.county);
  Log.find({ county: req.params.county })
    .then(countyLogs => {
      console.log(countyLogs);
      res.send(countyLogs);
    })
    .catch(err => {
      next(err);
    });
});

//GET See all posts from a certain date
router.get('/date/:year/:day', (req, res, next) => {
  console.log('dayOfYear', req.params.day);
  console.log('year', req.params.year);

  Log.find({ dayOfYear: req.params.day })
    .populate('creatorId')
    .then(dayLogs => {
      console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
      console.log(dayLogs);
      let yours = false;
      // console.log('THESE ARE THE DAY LOGS: ', dayLogs);
      let specificDay = dayLogs.filter(log => {
        // if (log.privateJournal && req.user.id != log.creatorId) {
        //   log.journal = 'This log is set to private';
        // }

        //THIS MAKES A JOURNAL PRIVATE TO ALL EXCEPT THE CREATOR

        if (req.user && req.user.id == log.creatorId._id) {
          yours = true;
          if (log.privateJournal) {
            log.madePrivate = true;
          }
        } else if (log.privateJournal) {
          console.log('LOG SET TO PRIVATE');
          log.journal = 'This log is set to private';
        } else if (log.creatorId.deleted) {
          log.journal = 'This user has deleted their account';
        }

        //THIS MAKES THE CREATOR'S NAME HIDDEN TO ALL EXCEPT THE CREATOR

        if (
          (log.hideCreator == true &&
            req.user &&
            req.user.id != log.creatorId._id) ||
          (log.hideCreator == true && !req.user)
        ) {
          let hiddenCreator = {
            username: 'This user has decided to keep their name private',
            gender: log.creatorId.gender
          };
          log.creatorId = hiddenCreator;
        } else if (log.creatorId.deleted) {
          let hiddenCreator = {
            username: 'Deleted',
            gender: log.creatorId.gender
          };
          log.creatorId = hiddenCreator;
        }
        console.log('log', log);
        console.log(log.madePrivate);
        return log.year == req.params.year;
      });
      console.log('THIS IS THE CORRECT YEAR', specificDay);
      let id;
      !req.user ? (id = null) : (id = req.user.id);
      console.log('ID', id);
      let dayOfYear = { specificDay, yours, id };
      res.json(dayOfYear);
    })
    .catch(err => {
      next(err);
    });
});

// GET see individual log
//Come back to this later and make this have some properties if the user clicks their own post
router.get('/view/:logId', (req, res, next) => {
  console.log(req.params.logId);

  Log.findById(req.params.logId)
    .then(foundLog => {
      console.log(foundLog);
      res.sendStatus(foundLog);
    })
    .catch(err => {
      next(err);
    });
});

//GET see time of log

//GET create log
router.get('/create', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('logs/create');
});

//POST Create a Log

router.post('/create', async (req, res, next) => {
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
      month
    } = req.body.info;

    // var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    // console.log('LOGGING!!!! user', ip);

    let ip = '100.44.178.190';

    let latitude;
    let longitude;

    const address = await axios.get(
      `http://api.ipstack.com/${ip}?access_key=${process.env.IPACCESSKEY}&format=1`
    );

    console.log('ADDRESS IS:', address.data);

    latitude = address.data.latitude;
    longitude = address.data.longitude;

    let fullAddress = await axios.get(
      `http://api.geonames.org/findNearestAddressJSON?lat=${latitude}&lng=${longitude}&username=${process.env.GEO_NAME}`
    );

    console.log('THE FULL ADDRESS:', fullAddress.data);

    let weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_KEY}`
    );

    console.log('THIS IS THE WEATHER', weather.data);
    console.log(weather.data.weather[0].main);
    const weatherStuff = {
      type: weather.data.weather[0].main,
      code: weather.data.weather[0].id,
      icon: weather.data.weather[0].icon
    };
    console.log('WEATHER STUFF', weatherStuff);

    const weatherType = weatherStuff.type;
    const weatherCode = weatherStuff.code;
    const weatherIcon = weatherStuff.icon;

    var now = new Date();

    let a = now.toString().split(' ');

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
      year: year
    };

    console.log('FINAL LOG:', log);

    Log.create(log)
      .then(createdLog => {
        req.user.createdToday = true;
        const infoToSendBack = { createdLog, user: req.user };

        res.json(infoToSendBack);
      })
      .catch(err => {
        res.send(err);
      });
  }
});

module.exports = router;

//Use PATCH to change Boolean values
