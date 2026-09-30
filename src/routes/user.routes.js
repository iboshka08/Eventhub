const express = require("express");
const {
  getUser,
  updateUser,
  changePassword,
  deleteUser
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/:id", getUser);
router.put("/:id/password", changePassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
