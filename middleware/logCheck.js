const Log = require('../models/Log');

module.exports = async (req, res, next) => {
  const log = Log.find(/* find most recent */);
  const today = new Date();

  // THIS LOGIC DOES NOT EXIST
  const isLogAlreadyCreated = log.date === today;

  if (isLogAlreadyCreated) {
    res.json({ message: 'You have already created a log today' });
  }

  next();
};
