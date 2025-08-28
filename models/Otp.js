const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true // only one OTP per user at a time
    },
    otp: { 
      type: String, 
      required: true 
    }, // can be hashed for better security
    expiresAt: { 
      type: Date, 
      required: true 
    }
  },
  { timestamps: true }
);

// (Optional) Auto-delete expired OTPs
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);

