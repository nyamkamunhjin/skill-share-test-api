const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const postSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: true,
  },
  body: {
    type: Schema.Types.String,
    requried: true,
  },
  // category:
  author: {
    type: Schema.Types.String,
    required: true,
  },
  likes: Schema.Types.Number,
  comments: [
    {
      comment: Schema.Types.String,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post', postSchema);
