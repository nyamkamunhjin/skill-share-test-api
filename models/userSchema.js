const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const userSchema = new Schema({
  username: {
    type: Schema.Types.String,
    // required: true,
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
  avatar: {
    type: Schema.Types.String,
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  firstName: {
    type: Schema.Types.String,
    required: true,
  },
  lastName: {
    type: Schema.Types.String,
    required: true,
  },
  gender: {
    type: Schema.Types.String,
    enum: ['Male', 'Female'],
    default: 'Male',
  },
  dateOfBirth: {
    type: Schema.Types.Date,
    // required: true,
  },
  userType: {
    type: Schema.Types.String,
    enum: ['Admin', 'Normal'],
    default: 'Normal',
    // required: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  reputationPoint: {
    type: Schema.Types.Number,
    default: 0,
    min: 0,
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
