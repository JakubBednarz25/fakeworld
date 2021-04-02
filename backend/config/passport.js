const mongoose = require("mongoose");
const steamStrategy = require("passport-steam");
const User = require("../models/user.model");

module.exports = (passport) => {
  passport.use(
    new steamStrategy(
      {
        returnURL: "http://localhost:5000/auth/return",
        realm: "http://localhost:5000",
        apiKey: process.env.STEAM_API_KEY,
        stateless: true,
      },
      function (identifier, profile, done) {
        User.findOne({ steamID: profile._json.steamid }, (err, user) => {
          if (!user) {
            var newUser = new User({
              steamID: profile._json.steamid,
              balance: 10000,
              displayName: profile._json.personaname,
              profilePicture: profile._json.avatar,
            });

            newUser.save((err, user) => {
              console.log("Created user..!");
              return done(err, user);
            });
          } else {
            return done(err, user);
          }
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.steamID);
  });

  passport.deserializeUser((steamid, done) => {
    User.findOne({ steamID: steamid }, (err, user) => {
      done(err, user);
    });
  });
};
