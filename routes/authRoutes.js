const express = require("express");
const {
  register,
  confirmAccount,
  login,
  forwardPassword,
  cambiarPassword,
  getUser,
} = require("../controllers/AuthController");
const { isAuthenticate } = require("../middleware/Auth");

const router = express.Router();

router.post("/register", register);
router.post("/confirm-account", confirmAccount);
router.post("/login", login);
router.post("/forward-password", forwardPassword);
router.post("/cambiar-password", cambiarPassword);
router.get("/user", isAuthenticate, getUser);

module.exports = router;
