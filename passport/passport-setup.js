const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        console.log(user);

        bcrypt.compare(password, user.password).then((res) => {
          if (res) return done(null, user);

          return done(null, false, { message: 'Incorrect password.' });
        });
      });
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        User.findOne({ email: token.user.email }, (err, user) => {
          if (err) {
            console.log(err);
            return done(null, false, { message: err.message });
          }

          return done(null, user);
        });
      } catch (error) {
        done(error);
      }
    }
  )
);
