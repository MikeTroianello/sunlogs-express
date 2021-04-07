const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  usernameLowerCase: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'nonbinary']
  },
  createdToday: {
    type: Boolean,
    default: false
  },
  hideProfile: {
    type: Boolean,
    default: false
  },
  privateJournalDefault: {
    type: Boolean,
    default: false
  },
  hideCreatorDefault: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  time: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
