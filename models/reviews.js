const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userImage: {
    type: String,
  },
  userName: {
    type: String,
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
