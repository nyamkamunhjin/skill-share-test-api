const router = require('express').Router();
const passport = require('passport');
const { findOneAndUpdate } = require('../models/commentSchema');
const commentSchema = require('../models/commentSchema');
const Post = require('../models/postSchema');
const userSchema = require('../models/userSchema');

// create
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = new Post({
        ...req.body,
        author: req.user._id,
      });

      return post.validate((err) => {
        if (err) {
          console.log(err);
          res.status(409).json({
            success: false,
            message: err.message,
          });
          // throw err;
        } else {
          post.save((err) => {
            if (err) {
            } else {
              res
                .status(200)
                .json({ success: true, message: 'post added to database.' });
            }
          });
        }
      });
    } catch (err) {
      res.status(409).json({ success: false, message: err.message });

      throw err;
    }
  }
);

router.post(
  '/addcomment',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let values = req.body.userId
        ? {
            comment: req.body.comment,
            user: req.body.userId,
          }
        : {
            comment: req.body.comment,
          };
      const comment = new commentSchema(values);
      await comment.save(async (err, doc) => {
        commentId = doc._id;

        const updatedPost = await Post.findOneAndUpdate(
          {
            _id: req.body.postId,
          },
          {
            $push: {
              comments: commentId,
            },
          },
          {
            new: true,
          }
        )
          .populate({
            path: 'author',
            model: 'User',
            select: { firstName: 1, lastName: 1 },
          })
          .populate({
            path: 'comments',
            model: 'Comment',
            populate: {
              path: 'user',
              model: 'User',
            },
          })
          .exec();
        res.status(200).json(updatedPost);
      });
    } catch (err) {
      res.status(409).json({ success: false, message: err.message });

      throw err;
    }
  }
);

router.delete(
  '/removecomment',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { postId, commentId } = req.body;

      commentSchema.findByIdAndDelete(commentId, async (err, doc) => {
        if (!err && doc) {
          await Post.findOneAndUpdate(
            {
              _id: postId,
            },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
          res.status(200).json({ success: true, message: 'deleted comment' });
        } else {
          res.status(409).json({ success: false, message: 'error occured' });
        }
      });
    } catch (err) {
      res.status(409).json({ success: false, message: err.message });

      throw err;
    }
  }
);

router.post(
  '/like',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { postId } = req.body;

      // determine like or unlike
      const checkPost = await Post.findOne({ _id: postId });
      // console.log(typeof checkPost, Object.values(checkPost.likes));
      const isIncrement = checkPost.likedUsers.includes(req.user._id);
      const update = !isIncrement
        ? {
            $push: {
              likedUsers: req.user._id,
            },
          }
        : {
            $pull: {
              likedUsers: req.user._id,
            },
          };

      const post = await Post.findOneAndUpdate(
        { _id: postId },
        {
          ...update,
          likes: !isIncrement
            ? checkPost.likes + 1
            : checkPost.likes <= 1
            ? 0
            : checkPost.likes - 1,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate({
          path: 'author',
          model: 'User',
          select: { firstName: 1, lastName: 1 },
        })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: {
            path: 'user',
            model: 'User',
          },
        })
        .exec();

      userSchema.findOneAndUpdate(
        { _id: post.author },
        {
          reputationPoint: !isIncrement
            ? req.user.reputationPoint + 1
            : req.user.reputationPoint <= 1
            ? 0
            : req.user.reputationPoint - 1,
        },
        { new: true, runValidators: true },
        (err, doc) => {
          console.log('reputation update doc', doc);
        }
      );
      res.status(200).json(post);
    } catch (err) {
      res.status(409).json({ success: false, message: err.message });

      throw err;
    }
  }
);

router.post('/like-anon', async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $inc: {
          likes: 1,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: 'author',
        model: 'User',
        select: { firstName: 1, lastName: 1 },
      })
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'user',
          model: 'User',
        },
      })
      .exec();
    res.status(200).json(post);
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });

    throw err;
  }
});

// for users
router.get('/id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate({
        path: 'author',
        model: 'User',
        select: { firstName: 1, lastName: 1 },
      })
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: {
          path: 'user',
          model: 'User',
        },
      })
      .exec();

    if (post && post.approved === 'approved') {
      return res.status(200).json(post);
    } else {
      return res.status(404).json({ success: false });
      // throw new Error(`Post doesn't exist`);
    }
  } catch (err) {
    res.status(409).json({ message: err.message });

    throw err;
  }
});
// admin
router.get(
  '/pending/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.userType !== 'Admin') {
        return res.status(403).json({ success: false, message: 'no access' });
      }

      const post = await Post.findById(id).populate({
        path: 'author',
        model: 'User',
        select: { firstName: 1, lastName: 1 },
      });

      if (post && post.approved === 'pending') {
        return res.status(200).json(post);
      } else {
        return res.status(404).json({ success: false });
        // throw new Error(`Post doesn't exist`);
      }
    } catch (err) {
      res.status(409).json({ message: err.message });

      throw err;
    }
  }
);

router.get(
  '/pending/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.userType !== 'Admin') {
        return res.status(403).json({ success: false, message: 'no access' });
      }

      const posts = await Post.find({
        approved: 'pending',
      }).populate({
        path: 'author',
        model: 'User',
        select: { firstName: 1, lastName: 1 },
      });

      if (posts) {
        return res.status(200).json(posts);
      } else {
        return res.status(404).json({ success: false });
      }
    } catch (err) {
      res.status(409).json({ message: err.message });

      throw err;
    }
  }
);

router.put(
  '/update/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.userType !== 'Admin') {
        return res.status(403).json({ success: false, message: 'no access' });
      }

      if (!id) throw new Error('if required.');

      const post = await Post.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });

      res.status(200).json(post);
    } catch (err) {
      res.status(409).json({ message: err.message });

      throw err;
    }
  }
);

router.delete(
  '/delete/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) throw new Error('if required.');

      const post = await Post.deleteOne({ _id: id });

      res.status(200).json(post);
    } catch (err) {
      res.status(409).json({ message: err.message });

      throw err;
    }
  }
);

// searching foods

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit, 10);
    console.log({ query, limit });
    const search = await Post.find({
      title: new RegExp(`^${query}`, 'i'),
      approved: 'approved',
    })
      .populate({
        path: 'author',
        model: 'User',
        select: { firstName: 1, lastName: 1 },
      })
      .limit(limit)
      .exec();
    // console.log(search);
    res.status(200).json(search);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});

module.exports = router;
