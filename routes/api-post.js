const router = require('express').Router();
const passport = require('passport');
const Post = require('../models/postSchema');

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
          // throw err;
        } else {
          post.save((err) => {
            if (err) throw new Error('post validation failed.');
            else {
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

// read by barcode
router.get('/id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (post) {
      return res.status(200).json(post);
    } else {
      throw new Error(`Post doesn't exist`);
    }
  } catch (err) {
    res.status(409).json({ message: err.message });

    throw err;
  }
});

router.put(
  '/update/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

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
    // const search = await Post.aggregate()
    //   .search({
    //     regex: {
    //       query: `${query}.*`,
    //       path: 'title',
    //       allowAnalyzedField: true,
    //     },
    //   })
    //   .project({ document: '$$ROOT', name_length: { $strLenCP: '$title' } })
    //   .sort({ name_length: 1 })
    //   .project({ name_length: 0 })
    //   .limit(limit);
    const search = await Post.find({
      title: new RegExp(`^${query}`, 'i'),
    }).limit(limit);
    // console.log(search);
    res.status(200).json(search);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});

module.exports = router;
