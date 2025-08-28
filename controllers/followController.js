// controllers/followController.js
const User = require("../models/User");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const userId = req.user._id; // logged in user
    const targetId  = req.params.id; // user to follow

      if (!targetId) {
          return res.status(404).json({status:"failed", message:"follower cannot be empty"})
    }
    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const user = req.user
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already following?
    if (user.following.includes(targetId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    user.following.push(targetId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    res.json({ message: "Successfully followed user" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
     const targetId = req.params.id;
     if (!targetId) {
          return res.status(404).json({status:"failed", message:"follower Id cannot be empty"})
      }
      if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }
    const user = req.user;
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    user.following = user.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    res.json({ message: "Successfully unfollowed user" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {  
  try {
    const userId  = req.params.id;
    const user = await User.findById(userId).populate("followers", "username profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({message:"success",followers: user.followers});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const userId  = req.params.id;
    const user = await User.findById(userId).populate("following", "username profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({status:"success", following: user.following});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
