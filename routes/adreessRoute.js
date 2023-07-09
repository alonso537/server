const express = require("express");
const { isAuthenticate } = require("../middleware/Auth");
const {
  createAdreess,
  getAdreess,
  deleteAdreess,
  updateAdreess,
} = require("../controllers/AdreessController");

const router = express.Router();

router.post("/create", isAuthenticate, createAdreess);
router.get("/", isAuthenticate, getAdreess);
router.delete("/:id", isAuthenticate, deleteAdreess);
router.put("/:id", isAuthenticate, updateAdreess);

module.exports = router;
