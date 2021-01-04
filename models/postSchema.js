const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const postSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: true,
  },
  content: {
    type: Schema.Types.String,
    requried: true,
  },
  // category:
  author: {
    type: Schema.Types.String,
    required: true,
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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

postSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post', postSchema);
