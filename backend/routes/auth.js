const passport = require("passport");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.json(req.user);
});

router.get("/login", passport.authenticate("steam"), (req, res) => {});

router.get(
  "/return",
  passport.authenticate("steam", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
