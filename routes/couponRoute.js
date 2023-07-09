const express = require("express");
const {
  apply,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} = require("../controllers/CouponController");
const { isAuthenticate, isAdmin } = require("../middleware/Auth");

const router = express.Router();

router.get("/apply", isAuthenticate, apply);
router.post("/create", isAuthenticate, isAdmin, createCoupon);
router.get("/all", isAuthenticate, isAdmin, getAllCoupons);
router.put("/update/:id", isAuthenticate, isAdmin, updateCoupon);
router.delete("/delete/:id", isAuthenticate, isAdmin, deleteCoupon);

module.exports = router;
