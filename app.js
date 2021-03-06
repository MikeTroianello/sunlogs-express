require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');




const app = express();

app.use(cors());

// WHEN INTRODUCING USERS DO THIS:
// INSTALL THESE DEPENDENCIES: passport-local, passport, bcryptjs, express-session
// AND UN-COMMENT OUT FOLLOWING LINES:

const session = require('express-session');
const passport = require('passport');

require('./configs/passport');

// IF YOU STILL DIDN'T, GO TO 'configs/passport.js' AND UN-COMMENT OUT THE WHOLE FILE

const uri = process.env.MONGODB_URI || 'mongodb://localhost/SuPro';

const live_server = process.env.MONGODB_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(
  `${app_name}:${path.basename(__filename).split('.')[0]}`
);



// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'sun-favicon.ico')));

// ADD SESSION SETTINGS HERE:
app.use(
  session({
    secret: 'some secret goes here',
    resave: true,
    saveUninitialized: true
  })
);

// USE passport.initialize() and passport.session() HERE:
app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:

// app.use(
//   cors({
//     credentials: true,
//     origin: ['http://sunlog.herokuapp.com']
//   })
// );



// ROUTES MIDDLEWARE STARTS HERE:


// const index = require('./routes/index');
// const newLog = require('./routes/newLog');
const log = require('./routes/log');
const authRoutes = require('./routes/auth-routes');

// app.use('/api', index);
// app.use('/api/newLog', newLog);
app.use('/api/log', log);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({msg: "SUCCESS"})
})

app.use((req, res, next) => {
  // If no routes match, send them the React HTML.
  res.sendFile(__dirname + '/public/index.html');
});

module.exports = app;
