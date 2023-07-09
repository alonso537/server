const User = require("../models/User");
const Product = require("../models/products");
const { productsSeed } = require("../productSeed");
const { userSeed } = require("../usersSeed");
const { seedPayments } = require("../paymenstSeed");
const Payment = require("../models/payment");

exports.seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(productsSeed);
    res.status(200).json({ message: "Seed successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.seedUsers = async (req, res) => {
  try {
    // await User.deleteMany({});
    await User.insertMany(userSeed);
    res.status(200).json({ message: "Seed successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.seedPayments = async (req, res) => {
  try {
    // await Payment.deleteMany({});
    await Payment.insertMany(seedPayments);
    res.status(200).json({ message: "Seed successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
