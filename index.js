const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const authRouter = require('./routes/api-auth');
const postRouter = require('./routes/api-post');
const userRouter = require('./routes/api-user');

require('dotenv').config();
require('./passport/passport-setup');

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);

app.get('/', async (req, res) => res.send('hello from api'));
// connect to mongo db
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-bojs0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log('Connected to Mongo Atlas');
    app.listen(process.env.PORT, '', () => {
      console.log('Listening on port:', process.env.PORT);
    });
  })
  .catch((err) => console.log(err));
