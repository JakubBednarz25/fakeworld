const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
  gameName: {
    type: String,
    required: true,
  },
  bets: {
    type: [String],
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Game", gameSchema);
