const router = require("express").Router();

router.get("/", (req, res) => {
  res.send(Math.floor(Math.random() * 15).toString());
});

module.exports = router;
