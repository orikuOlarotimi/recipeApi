const express = require('express')
const router = express.Router()
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Refresh token
router.post("/refresh-token", authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

router.post("/verifyOtp", authController.verifyOtp)

module.exports = router;
