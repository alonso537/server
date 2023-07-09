const express = require("express");
const { isAuthenticate } = require("../middleware/Auth");
const {
  getAllBasket,
  AddToBasket,
  deleteProductForBasket,
} = require("../controllers/BasketController");

const router = express.Router();

router.get("/", isAuthenticate, getAllBasket);
router.post("/", isAuthenticate, AddToBasket);
router.delete("/:id", isAuthenticate, deleteProductForBasket);

module.exports = router;
