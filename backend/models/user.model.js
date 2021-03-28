const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  steamID: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
