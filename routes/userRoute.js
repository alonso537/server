const express = require("express");
const { isAuthenticate, isAdmin } = require("../middleware/Auth");
const {
  updateUserClient,
  changeFoto,
  getAllUsers,
  changeRole,
} = require("../controllers/UserController");

const router = express.Router();

router.put("/update-user", isAuthenticate, updateUserClient);
router.put("/change-foto", isAuthenticate, changeFoto);
router.get("/get-all-users", isAuthenticate, isAdmin, getAllUsers);
router.put("/change-role/:id", isAuthenticate, isAdmin, changeRole);

module.exports = router;
