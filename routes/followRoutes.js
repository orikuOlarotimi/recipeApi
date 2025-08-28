const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/:id/follow", authMiddleware, followController.followUser);
router.post("/:id/unfollow", authMiddleware, followController.unfollowUser);

router.get("/:id/followers", followController.getFollowers);
router.get("/:id/following", followController.getFollowing);

module.exports = router;