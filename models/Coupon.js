const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 6,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  expiry: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["general", "especifico"],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  active: {
    type: Boolean,
    default: true,
  },

  category: {
    type: String,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
