const User = require('../models/User')

exports.getProfile = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      preferences: user.preferences,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {      
  try {
    const { username, bio, profilePic, preferences } = req.body;

    // whitelist allowed fields
    const updates = {};
    if (username) updates.username = username.trim();
    if (bio) updates.bio = bio.trim();
    if (profilePic) updates.profilePic = profilePic;
    if (preferences) updates.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Profile updated successfully",
      status:  "success",
      updatedFields: updates
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};