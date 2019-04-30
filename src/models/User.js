/* eslint-disable */

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

// User Model Schema
const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  displayName: String,
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // err code 11000
    validate: value => validator.isEmail(value)
  },
  password: {
    minlength: 4,
    type: String,
    required: true
  },
  phone: {
    type: String,
    validate: value => validator.isMobilePhone(value)
  }
}, { timestamps: true });

userSchema.statics.authenticate = function (email, password, callback) {
  this.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
};

// Hooks
userSchema.pre('save', function (next) {
  var user = this;
  if (!user.displayName) {
    user.displayName = `${user.fname} ${user.lname.charAt(0).toUpperCase()}`
  }
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    return next();
  });
});

const User = mongoose.model('User', userSchema);

module.exports = User;
