const express = require('express');
const authRoutes = express.Router();

const passport = require('passport');
const bcrypt = require('bcryptjs');

// require the user model !!!!
const User = require('../models/User');
const Log = require('../models/Log');

// CREATING A NEW USER

authRoutes.post('/signup', (req, res, next) => {
  console.log('THIS IS WHAT WE HAVE:', req.body.state.username);

  const { username, password, gender, email, phone } = req.body.state;
  const usernameLowerCase = username.toLowerCase();

  if (!username || !password) {
    console.log('IT IS BREAKING DUE TO NO USERNAME AND OR PASSWORD');
    res.status(400).json({ message: 'Provide username and password' });
    return;
  }

  if (password.length < 6) {
    console.log('THE PASSWORD IS NOT 6 OR GREATER');
    res.status(400).json({
      message:
        'Please make your password at least 6 characters long for security purposes.'
    });
    return;
  }

  User.findOne({ usernameLowerCase }, (err, foundUser) => {
    console.log('USER.FINDONE HAS BEEN CALLED');
    if (err) {
      console.log('FIRST ERROR', err);
      res.status(500).json({ message: 'Username check went bad.' });
      return;
    }

    if (foundUser) {
      console.log('THIS IS WHERE IT BROKE');
      res.status(400).json({ error: 'Username taken. Choose another one.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const aNewUser = new User({
      username: username,
      password: hashPass,
      usernameLowerCase,
      gender,
      email,
      phone
    });

    aNewUser.save(err => {
      if (err) {
        console.log('IT BROKE AT THE SAVING THE USER', err);
        res
          .status(400)
          .json({ message: 'Saving user to database went wrong.' });
        return;
      }

      // Automatically log in user after sign up
      req.login(aNewUser, err => {
        if (err) {
          console.log('IT BROKE AT THE LOGIN');
          res.status(500).json({ message: 'Login after signup went bad.' });
          return;
        }

        // Send the user's information to the frontend
        // We can use also: res.status(200).json(req.user);
        res.status(200).json(aNewUser);
      });
    });
  });
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res
        .status(500)
        .json({ message: 'Something went wrong authenticating user' });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.status(401).json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, err => {
      if (err) {
        res.status(500).json({ message: 'Session save went bad.' });
        return;
      }

      if (req.user.deleted) {
        console.log('DELETED USER-=-=-=-=-=-=-=');
        res.json({ message: 'This account was deleted' });
        return;
      } else {
        Log.find({ creatorId: req.user.id }).then(results => {
          console.log('THE LOGS', results);

          //FIX THIS LATER, THIS IS JUST A PLACEHOLDER
          var now = new Date();
          var start = new Date(now.getFullYear(), 0, 0);
          var diff =
            now -
            start +
            (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
          var oneDay = 1000 * 60 * 60 * 24;
          var day = Math.floor(diff / oneDay);
          console.log('Day of year: ' + day);

          // day if the dayOfYear

          let a = now.toString().split(' ');
          let year = Number(a[3]);

          results.map(log => {
            if (log.dayOfYear == req.body.day && log.year == req.body.year) {
              req.user.createdToday = true;
            }
          });
          console.log('CREATED A LOG TODAY?', req.user.createdToday);
          res.json(req.user);
          return;
        });
      }
    });
  })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  console.log('WE ARE LOGGING OUT NOW');
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

// authRoutes.get('/loggedin', (req, res, next) => {
//   console.log('LOGGED IN IS CALLED -=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');
//   console.log(req.body);
//   console.log('DATE STUFF', req.body.dateStuff);
//   console.log('DATE STUFF ONE MORE TIME', req.body.dateStuff.day);
//   if (req.isAuthenticated()) {
//     console.log(req.user.username, 'is logged in!');
//     req.user.createdToday = false;
//     Log.find({ creatorId: req.user.id }).then(results => {
//       results.map(log => {
//         if (log.dayOfYear == req.body.day && log.year == req.body.year) {
//           req.user.createdToday = true;
//         }
//       });
//       console.log('CREATED A LOG TODAY?', req.user.createdToday);
//       req.user.save();
//       // req.user.password = null;
//       res.json(req.user);
//       return;
//     });
//   } else {
//     console.log('FAILED');
//     res.status(403).json({ message: 'Unauthorized' });
//   }
// });

authRoutes.get('/loggedin/:day/:year', (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log(req.user.username, 'is logged in!');
    req.user.createdToday = false;
    Log.find({ creatorId: req.user.id }).then(results => {
      results.map(log => {
        if (log.dayOfYear == req.params.day && log.year == req.params.year) {
          req.user.createdToday = true;
        }
      });
      console.log('CREATED A LOG TODAY?', req.user.createdToday);
      req.user.save();
      // req.user.password = null;
      res.json(req.user);
      return;
    });
  } else {
    console.log('FAILED');
    res.status(403).json({ message: 'Unauthorized' });
  }
});

authRoutes.post('/change-info', (req, res, next) => {
  console.log('REQ DOT BODY', req.body.userInfo);
  if (req.isAuthenticated()) {
    console.log(req.user.username, 'is logged in!');

    if (req.user.phone !== req.body.userInfo.phone && req.body.userInfo.phone) {
      console.log('PHONES DONT MATCH', req.user.phone, req.body.userInfo.phone);
      req.user.phone = req.body.userInfo.phone;
    }
    if (req.user.email !== req.body.userInfo.email && req.body.userInfo.email) {
      console.log('emailS DONT MATCH', req.user.email, req.body.userInfo.email);
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
    req.user.save();
    res.json({ message: 'Settings Changed!' });
  } else {
    console.log('FAILED');
    res.status(403).json({ message: 'Unauthorized' });
  }
});

authRoutes.post('/delete-user', (req, res, next) => {
  if (req.isAuthenticated()) {
    const id = req.user.id;
    console.log('user is authenticated');

    if (req.body.confirmation === req.user.username) {
      console.log('CONFIRMED');
      req.user.name = 'Deleted';
      req.user.deleted = true;
      req.user.save();
      req.logout();
      res.json({ message: 'User has been deleted' });
    } else {
      console.log('did not enter the proper name!');
      res.json({ message: 'You did not type the proper name!' });
    }
  } else {
    console.log('FAILED');
    res.status(403).json({ message: 'Unauthorized' });
  }
});

module.exports = authRoutes;

// module.exports = authRoutes;
