const express = require('express');
const router = express.Router();

const passport = require('passport');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const jwt = require('jsonwebtoken');
const ensureLogin = require('connect-ensure-login');
const User = require('../models/User');

//ALL SIGNUP/LOGIN ROUTES WILL BE HERE

//GET Login Page

router.get('/isLoggedIn/:id', (req, res, next) => {
  console.log('IS LOGGED IN', req.params.id);
  User.findById(req.params.id).then(result => {
    console.log(`we found you, ${result.username}`);

    console.log('???????');
  });
});

router.get('/isLoggedin', (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if (req.isAuthenticated()) {
    console.log(req.user, 'is logged in!');
    res.status(200).json(req.user);
    return;
  }
  console.log("It still doesn't work");
  res.status(403).json({ message: 'Unauthorized' });
});

router.get('/login', (req, res, next) => {
  console.log('failure');
  // res.send('We are at the login page');
  res.render('user/login.hbs');
});

//GET Signup page
router.get('/signup', (req, res, next) => {
  res.send('We are at the signup page');
  // res.render('user/signup.hbs');
});

//POST Signup
router.post('/signup', (req, res, next) => {
  console.log('hello', req.body);
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;

  if (username === '' || password === '' || gender === '') {
    console.log('missing username or password');
    res.json({ message: 'Username, Password, and Gender must be entered' });
    return;
  }

  User.findOne({ username })
    .then(user => {
      console.log('USER FOUND:', user);
      if (user !== null) {
        res.json({ message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        email,
        phone,
        gender
      });

      console.log('almost there', newUser);

      newUser.save(err => {
        if (err) {
          res.json({ message: err });
        } else {
          req.login(newUser, err => {
            if (err) {
              res.status(500).json({ message: 'Login after signup went bad.' });
              return;
            }

            const { username, _id, gender } = newUser;
            const userToLocalStorage = { username, _id, gender };
            res.status(200).json({
              message: 'User has been created',
              user: userToLocalStorage
            });
          });
        }
      });
    })
    .catch(error => {
      next(error);
    });
});

//POST New Login User

// router.post('/login', (req, res, next) => {
//   passport.authenticate('local', (err, theUser, failureDetails) => {
//     if (err) {
//       res
//         .status(500)
//         .json({ message: 'Something went wrong authenticating user' });
//       return;
//     }

//     if (!theUser) {
//       // "failureDetails" contains the error messages
//       // from our logic in "LocalStrategy" { message: '...' }.
//       res.status(401).json(failureDetails);
//       return;
//     }

//     // save user in session
//     req.login(theUser, err => {
//       if (err) {
//         res.status(500).json({ message: 'Session save went bad.' });
//         return;
//       }

//       console.log('theUser', theUser);
//       console.log('req.user', req.user);

//       // We are now logged in (that's why we can also send req.user)
//       // res.redirect('/isLoggedIn');
//       res.status(200).json(theUser);
//     });
//   })(req, res, next);
// });

///END
///////
///////////
///////////////

router.get('/profile', (req, res) => {
  console.log('YEET', req);
  res.json(req.user);
  // res.render('user/profile', { user: req.user });
});

// router.get('/logout', (req, res) => {
//   req.logout();
//   // res.send('logged oot');
//   res.redirect('/login');
// });

//POST Delete user

// router.post('/delete-user', (req,res,next) =>)

/* GET home page */
router.get('/', (req, res, next) => {
  // res.send('home');
  res.render('index');
});

// POST Logout
router.post('/logout', (req, res, next) => {
  req.logout();
  res.json({ message: 'You have been logged out. Come back soon!' });
});

module.exports = router;

//how to authenticate a user without logging out

// newUser.save((err) => {
//   if (err) {
//     res.render("auth-signup", { message: "Something went wrong" });
//   } else {
//     passport.authenticate('local')(req, res, function () {
//       res.redirect('/profile');
//     })
//   }
// });
