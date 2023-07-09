const express = require("express");
const { isAuthenticate, isAdmin } = require("../middleware/Auth");
const {
  checkoutSession,
  webhook,
  getPayments,
  getAmountOfPaymentsForMounth,
  stats,
} = require("../controllers/PaymentController");

const router = express.Router();

router.post("/create-checkout-session", isAuthenticate, checkoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);
router.get("/", isAuthenticate, isAdmin, getPayments);
router.get("/amount", isAuthenticate, isAdmin, getAmountOfPaymentsForMounth);
router.get("/stats", isAuthenticate, isAdmin, stats);

module.exports = router;
