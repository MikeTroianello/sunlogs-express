const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
  mood: {
    type: Number,
    min: 1,
    max: 5
  },
  productivity: {
    type: Number,
    min: 1,
    max: 5
  },
  weatherType: {
    type: String
  },
  weatherCode: {
    type: Number
  },
  weatherIcon: {
    type: String
  },
  externalFactors: {
    type: String
  },
  journal: {
    type: String
    //Max length will be created on the front end
  },
  privateJournal: {
    type: Boolean,
    default: false
  },
  latitude: Number,
  longitude: Number,
  county: String,
  state: String,
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  hideCreator: {
    type: Boolean,
    default: false
  },
  dayOfWeek: String,
  month: String,
  dayOfMonth: Number,
  dayOfYear: Number,
  year: Number,
  timeStamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
