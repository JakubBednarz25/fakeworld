const router = require("express").Router();
const Game = require("../models/game.model");
const User = require("../models/user.model.js");

router.post("/result", (req, res) => {
  const game = req.body.game;
  var result = req.body.result;

  if (!game || !result) {
    return;
  }

  cardrow.forEach((card) => {
    if (result === parseInt(card.number)) {
      result = card.color.toUpperCase();
    }
  });

  var multiplier;

  if (result === "RED" || result || "BLACK") {
    multiplier = 2;
  } else {
    multiplier = 14;
  }

  Game.findOne({ gameName: game }, (err, game) => {
    const bets = game.bets;
    bets.forEach((bet) => {
      let parsedBet = JSON.parse(bet);
      let bet_choice = parsedBet.choice;
      let bet_amount = parsedBet.amount;
      if (bet_choice === result) {
        User.findOne({ steamID: parsedBet.id }, (err, user) => {
          if (err) {
            console.log(err);
          }
          (user.steamID = user.steamID),
            (user.displayName = user.displayName),
            (user.profilePicture = user.profilePicture);
          user.balance = user.balance + bet_amount * multiplier;
          if (user.balance === 0) {
            user.balance = 10000;
          }
          user
            .save()
            .then(() => console.log("Updated user balance! (won)"))
            .catch((err) => console.log(err));
        });
      }
    });
    game.gameName = game.gameName;
    game.isOpen = game.isOpen;
    game.bets = [];

    game
      .save()
      .then(() => console.log("Game information updated."))
      .catch((err) => console.log(err));
  });
});

router.get("/:game/isopen", (req, res) => {
  Game.findOne({ gameName: "roulette" }, (err, game) => {
    if (err) {
      res.status(400).json((err) => {
        console.log(err);
      });
    }
    res.status(200).json({ open: game.isOpen });
  });
});

router.post("/open/:boolOpen", (req, res) => {
  const gameName = req.body.game;
  const open = req.params.boolOpen;
  console.log(`19: ${open}`);
  if (gameName === "roulette") {
    Game.findOne({ gameName: "roulette" }, (err, game) => {
      if (err) {
        console.log(err);
        return;
      }
      (game.gameName = game.gameName),
        (game.bets = game.bets),
        (game.isOpen = open);

      game
        .save()
        .then()
        .catch((err) => {
          console.log(err);
        });
    });
  }
});

router.post("/add", (req, res) => {
  const name = req.body.name;
  if (!name) {
    return;
  }
  Game.findOne({ gameName: name }, (err, user) => {
    if (!user) {
      var game = new Game({
        gameName: name,
        bets: [],
        isOpen: false,
      });

      game.save((err, user) => {
        console.log("Game-type created..");
      });
    }
  });
  res.send("Done");
});

router.post("/", (req, res) => {
  const gameName = req.body.gameName;
  const id = req.body.id;
  const choice = req.body.choice;
  const amount = req.body.amount;

  if (!gameName || !id || !choice || !amount) {
    res.status(400).json("Invalid params.");
    return;
  }

  Game.findOne({ gameName: gameName }, (err, game) => {
    game.gameName = gameName;
    game.isOpen = game.isOpen;
    if (!game.isOpen) {
      res.status(400).json("Betting is closed!");
    }
    let canAddNew = false;
    if (game.bets.length === 0) {
      canAddNew = true;
    } else {
      canAddNew = !game.bets.some((bet) => {
        let parsedBet = JSON.parse(bet);
        let bet_id = parsedBet.id.toString();
        let bet_choice = parsedBet.choice.toString();
        return bet_id === id && bet_choice === choice;
      });
    }

    if (!canAddNew) {
      game.bets = game.bets.map((bet) => {
        let parsedBet = JSON.parse(bet);
        let bet_id = parsedBet.id.toString();
        let bet_choice = parsedBet.choice.toString();
        let bet_amount = parseInt(parsedBet.amount);
        if (bet_id === id && bet_choice === choice) {
          return JSON.stringify({
            id: bet_id,
            choice: bet_choice,
            amount: bet_amount + parseInt(amount),
          });
        }
        return bet;
      });
    } else {
      game.bets.push(
        JSON.stringify({ id: id, choice: choice, amount: amount })
      );
    }

    User.findOne({ steamID: id }, (err, user) => {
      if (err) {
        console.log(err);
      }
      if (parseInt(user.balance) < amount) {
        res.status(400).json("Balance less than amount user tried to bet.");
        return;
      } else {
        (user.steamID = user.steamID),
          (user.balance = user.balance - amount),
          (user.displayName = user.displayName),
          (user.profilePicture = user.profilePicture);
        user
          .save()
          .then(() => console.log("Bet placed!"))
          .catch((err) => console.log(err));
        game
          .save()
          .then(() => res.json("Updated!"))
          .catch((err) => res.status(400).json(`Error: ${err}`));
      }
    });
  });
});

const cardrow = [
  {
    color: "red",
    number: "1",
  },
  {
    color: "black",
    number: "14",
  },
  {
    color: "red",
    number: "2",
  },
  {
    color: "black",
    number: "13",
  },
  {
    color: "red",
    number: "3",
  },
  {
    color: "black",
    number: "12",
  },
  {
    color: "red",
    number: "4",
  },
  {
    color: "green",
    number: "0",
  },
  {
    color: "black",
    number: "11",
  },
  {
    color: "red",
    number: "5",
  },
  {
    color: "black",
    number: "10",
  },
  {
    color: "red",
    number: "6",
  },
  {
    color: "black",
    number: "9",
  },
  {
    color: "red",
    number: "7",
  },
  {
    color: "black",
    number: "8",
  },
];

module.exports = router;
