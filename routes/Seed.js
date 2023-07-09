const express = require("express");
const { isAuthenticate, isAdmin } = require("../middleware/Auth");
const {
  seedProducts,
  seedUsers,
  seedPayments,
} = require("../controllers/Seed");

const router = express.Router();

router.post("/seedProduct", isAuthenticate, isAdmin, seedProducts);
router.post("/seedUsers", isAuthenticate, isAdmin, seedUsers);
router.post("/seedPayments", isAuthenticate, isAdmin, seedPayments);

module.exports = router;
