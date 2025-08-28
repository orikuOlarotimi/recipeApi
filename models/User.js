const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is needed'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    
    mobile: {
        type: Number,
        required: [true, 'Mobile number is required ']
    }, 
    
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" }, 

   
    preferences: {
      dietary: { type: [String], default: [] }, 
      cuisines: { type: [String], default: [] }, // e.g., ["Italian", "Indian"]
      notifications: { type: Boolean, default: true }
    },

    verified: { type: Boolean, default: false },
     trustedDevices: [
    {
      deviceId: { type: String, required: true }, // uuid
      addedAt: { type: Date, default: Date.now },
      lastUsedAt: { type: Date, default: Date.now }
    }
  ],
     favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

}, { timestamps: true })
// implement roles !

module.exports = mongoose.model('User', userSchema)
