const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const postSchema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      required: true,
    },
    titleContent: {
      type: Schema.Types.String,
      required: true,
    },
    content: {
      type: Schema.Types.String,
      requried: true,
      unique: true,
    },
    // category:
    author: {
      type: Schema.Types.String,
      required: true,
    },
    approved: {
      type: Schema.Types.String,
      enum: ['approved', 'pending', 'declined'],
      default: 'pending',
    },
    likes: { type: Schema.Types.Number, default: 0, min: 0 },
    likedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

postSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post', postSchema);
