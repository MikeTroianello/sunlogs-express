const bcrypt = require('bcryptjs');
const bcryptSalt = 10;

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Log = require('../models/Log');

const signup = async (req, res) => {
  try {
    const { username, password, gender, email, phone } = req.body;
    const usernameLowerCase = username.toLowerCase();
    if (!username || !password) {
      res.status(400).json({ message: 'Provide username and password' });
      return;
    }

    let user = await User.findOne({ usernameLowerCase });

    if (user) {
      res.json({ message: 'The username already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashPass,
      usernameLowerCase,
      gender,
      email,
      phone,
    });

    await newUser.save((err) => {
      if (err) {
        console.log('ERROR', err);
        res.json({ message: err });
      }
    });

    const payload = {
      user: {
        id: newUser.id,
      },
    };

    let token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: 360000,
    });
    res.json({ user: newUser, token });
  } catch (err) {
    console.log('ERROR', err);
    res.status(500).send(err);
  }
};

const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    let usernameLowerCase = username.toLowerCase();

    let user = await User.findOne({ usernameLowerCase });

    if (!user) {
      return res.status(400).json({ message: 'Username not found' });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Password was incorrect' });
    }

    const results = await Log.find({ creatorId: user.id });

    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff =
      now -
      start +
      (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
    var oneDay = 1000 * 60 * 60 * 24;

    let a = now.toString().split(' ');

    results.map((log) => {
      if (log.dayOfYear == req.body.day && log.year == req.body.year) {
        user.createdToday = true;
      }
    });

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: 3600000,
    });

    res.status(200).json({ user, token });
  } catch (err) {
    res.json({ message: 'Something went wrong' });
  }
};

const logout = (req, res, next) => {
  res.status(200).json({ message: 'Log out success!' });
};

const loggedIn = async (req, res, next) => {
  let user = await User.findById(req.user.id);
  let results = await Log.find({ creatorId: req.user.id });
  results.map((log) => {
    if (log.dayOfYear == req.params.day && log.year == req.params.year) {
      user.createdToday = true;
    }
  });
  await User.findByIdAndUpdate(req.user.id, {
    createdToday: req.user.createdToday,
  });
  res.json({ user, token: res.token });
  return;
};

const changeInfo = async (req, res, next) => {
  try {
    if (req.user.phone !== req.body.userInfo.phone && req.body.userInfo.phone) {
      req.user.phone = req.body.userInfo.phone;
    }
    if (req.user.email !== req.body.userInfo.email && req.body.userInfo.email) {
      req.user.email = req.body.userInfo.email;
    }

    if (
      req.body.userInfo.oldPass &&
      req.body.userInfo.newPass &&
      req.body.userInfo.oldPass.length >= 6 &&
      req.body.userInfo.newPass.length >= 6 &&
      req.body.userInfo.oldPass === req.body.userInfo.oldPass
    ) {
      const newPass = req.body.userInfo.newPass;
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(newPass, salt);
      req.user.password = hashPass;
    }
    req.user.hideProfile = req.body.userInfo.hideProfile;
    req.user.privateJournalDefault = req.body.userInfo.privateJournalDefault;
    req.user.hideCreatorDefault = req.body.userInfo.hideCreatorDefault;

    await User.findByIdAndUpdate(req.user.id, { ...req.user });
    res.json({ message: 'Settings Changed!' });
  } catch (err) {
    console.log('Failed', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.user.id;

    if (req.body.confirmation === req.user.username) {
      req.user.name = 'Deleted';
      req.user.deleted = true;
      await User.findByIdAndUpdate(req.user.id, { ...req.user });
      res.json({ message: 'User has been deleted' });
    } else {
      res.json({ message: 'You did not type the proper name!' });
    }
  } catch (err) {
    console.log('FAILED', err);
    res.status(500).send(err);
  }
};

module.exports = {
  signup,
  login,
  logout,
  loggedIn,
  changeInfo,
  deleteUser,
};
