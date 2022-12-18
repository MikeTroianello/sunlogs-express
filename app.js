require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());

// const uri = process.env.MONGODB_URI || "mongodb://localhost/SuPro";
const uri = "mongodb://localhost/SuPro2";

// const live_server = process.env.MONGODB_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
  })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "sun-favicon.ico")));

// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:

// app.use(
//   cors({
//     credentials: true,
//     origin: ['http://sunlog.herokuapp.com']
//   })
// );

// ROUTES MIDDLEWARE STARTS HERE:

const log = require("./routes/logOLD");
const authRoutes = require("./routes/authRoutes");

app.use("/api/log", log);
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.json({ msg: "SUCCESS" });
});

module.exports = app;
