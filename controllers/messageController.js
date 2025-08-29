const Message = require("../models/Message");
const User  = require("../models/User")

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !text) {
      return res.status(400).json({ status: "failed", message: "Receiver and text are required" });
      }
      
      const receiver = await User.findById(receiver)
      if (!receiver) {
            return res.status(404).json({status:"failed", message:"user not found"})
      }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text
    });

    await message.save();

    res.status(201).json({ status: "success", data: message });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
