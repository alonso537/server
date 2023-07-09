const express = require("express");
const { isAuthenticate } = require("../middleware/Auth");
const {
  addReview,
  getReviewForProduct,
} = require("../controllers/ReviewController");

const router = express.Router();

router.post("/:id", isAuthenticate, addReview);
router.get("/:id", getReviewForProduct);

module.exports = router;
