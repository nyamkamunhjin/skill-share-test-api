const router = require('express').Router();
const bcrypt = require('bcrypt');

const passport = require('passport');
const postSchema = require('../models/postSchema');
const User = require('../models/userSchema');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log(req.user);

      res.status(200).json(req.user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log(req.user);
      const posts = await postSchema
        .find({
          author: req.user._id,
        })
        .populate({
          path: 'author',
          model: 'User',
          select: { firstName: 1, lastName: 1 },
        });
      res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.post(
  '/update',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.userType === 'Normal' && req.body.userType) {
        return res
          .status(409)
          .json({ success: false, message: 'no permission' });
      }

      let updatedUserInfo;
      if (req.body.password) {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
        updatedUserInfo = { ...req.body, password: hashedPassword };
      } else {
        updatedUserInfo = req.body;
      }

      User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        { $set: updatedUserInfo },
        {
          new: true,
        },
        (err, doc) => {
          if (err || !doc) console.log(err);
          else {
            res.status(200).json(doc);
          }
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
