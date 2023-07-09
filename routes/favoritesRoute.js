const express = require("express");
const { isAuthenticate } = require("../middleware/Auth");
const {
  addFavorite,
  getFavorites,
  deleteFavorite,
} = require("../controllers/FavoritesController");

const router = express.Router();

router.post("/", isAuthenticate, addFavorite);
router.get("/", isAuthenticate, getFavorites);
router.delete("/", isAuthenticate, deleteFavorite);

module.exports = router;
