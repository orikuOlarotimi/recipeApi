const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const nodemailer = require("nodemailer");
const emailValidator = require("email-validator");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwtTokens")
const Otp = require("../models/Otp");
const crypto = require("crypto");
const dotenv = require("dotenv")
const sendOTP = require("../utils/sendOtp") 
const { v4: uuidv4 } = require("uuid");
dotenv.config()

exports.signup = async (req, res) => {
    try {
        const { username, password, mobile, email } = req.body
        if (!email || email.trim().length === 0)
        {
            return res.status(400).json({ message: 'Email is required' });
        }
        const trimmedEmail = email.trim();
        if (trimmedEmail.length > 254)
        {
            return res.status(400).json({ message: 'Email is too long (max 254 characters)' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail))
        {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        let existingUser = await User.findOne({ email: trimmedEmail })
    
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        if (!password || password.trim().length === 0)
        {
            return res.status(400).json({ message: 'Password cannot be empty or just spaces' });
        }
        
        if (password.trim().length < 4)
        {
            return res.status(400).json({ message: 'Password must be at least 4 characters long' });
        }
        if (!username || username.trim().length === 0)
        {
            return res.status(400).json({ message: "Username is required" });
        }

        const trimmedUsername = username.trim();

        if (trimmedUsername.length < 3 || trimmedUsername.length > 30)
        {
            return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
        }

        const usernameRegex = /^[a-zA-Z0-9._]+$/;
        if (!usernameRegex.test(trimmedUsername))
        {
            return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and dots" });
        }

        // Check unique username
        let existingUsername = await User.findOne({ username: trimmedUsername });
        if (existingUsername)
        {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Mobile validation
        if (!mobile || mobile.trim().length === 0)
        {
            return res.status(400).json({ message: "Mobile number is required" });
        }

        const trimmedMobile = mobile.trim();

        // Example: 10-digit local mobile number
        const mobileRegex = /^[0-9]{11}$/;
        if (!mobileRegex.test(trimmedMobile))
        {
            return res.status(400).json({ message: "Invalid mobile number format" });
        }

        // Check unique mobile
        let existingMobile = await User.findOne({ mobile: trimmedMobile });
        if (existingMobile)
        {
            return res.status(400).json({ message: "Mobile number already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            username:trimmedUsername,
            mobile: trimmedMobile,
            email:trimmedEmail,
            password: hashedPassword
        })
        
        try {
             await sendOTP(newUser);
            const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );

          res.cookie("otpToken", token, {
            httpOnly: true,        // cannot be accessed via JS
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "Strict",    // CSRF protection
            maxAge: 15 * 60 * 1000 // 15 minutes
          });

          return res.status(201).json(
            {
              message: "User created sucessfully. OTP sent to email.",
              status: "success",
              user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
              }
        })
        } catch (error) {
          if (newUser?._id)
          {
              await User.findByIdAndDelete(newUser._id);
          }
            return res.status(500).json({ message: "Signup failed", error: error.message });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    } 
    
}
exports.login = async (req, res) => {
        try {
            let { email, password } = req.body
            email = email ? email.trim() : "";
            password = password ? password.trim() : "";
            if (!email)
            {
                return res.status(400).json({ message: "Email is required" });
            }  
            if (!emailValidator.validate(email))
            {
                return res.status(400).json({ message: "Invalid email format" });
            }

            // Password validation
            if (!password)
            {
                return res.status(400).json({ message: "Password is required" });
            }
            if (password.length < 4)
            {
                return res.status(400).json({ message: "Password must be at least 4 characters long" });
            }
            
            // Find user
            const user = await User.findOne({ email });
            if (!user)
            {
                return res.status(400).json({ message: "Invalid email or password" });
            }
          
            const isMatch = bcrypt.compare(password, user.password)
            if (!isMatch)
            {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            if (!user.verified) {
              // If not verified, trigger OTP sending  
            res.clearCookie("otpToken");  
              sendOTP(user)
              const otpToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );
              return res
                        .cookie("otpToken", otpToken, { httpOnly: true,secure: process.env.NODE_ENV === "production", sameSite: "Strict",maxAge: 15 * 60 * 1000 })
                        .status(403)
                        .json({
                          message: "Account not verified. OTP sent to your email.",
                        });
          }
          let deviceId = req.cookies.deviceId;
          if (!deviceId) {
            res.clearCookie("otpToken");
            await sendOTP(user);
            const otpToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );
             return res
            .cookie("otpToken", otpToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict",maxAge: 15 * 60 * 1000 })
            .status(403)
            .json({
              message: "New device detected. OTP required to verify new device. AN Otp has been sent to your email to verify ",
            });
          }

          const trustedDevice = user.trustedDevices.find(d => d.deviceId === deviceId);
          if (!trustedDevice) {
            // Device not recognized → require OTP
            res.clearCookie("otpToken");
            await sendOTP(user);
            const otpToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );
            return res
            .cookie("otpToken", otpToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict",maxAge: 15 * 60 * 1000 })
            .status(403)
            .json({
              message: "New device detected. OTP required to verify new device. AN Otp has been sent to your email",
            });
          }
          // 5. Update lastUsedAt for this device
          trustedDevice.lastUsedAt = new Date();
          await user.save();
          
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

            // Save refresh token in secure cookie
          res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000
          });  

          return res.status(200).json({ message: "Login successful", accessToken });
            
        } catch (error) {
          console.log(error)
          return res.status(500).json({ message: "Server error", error: error.message });
          
        }
}
exports.refreshToken = (req, res) => { 
    try {
        const refreshToken = req.cookies.refreshToken; // from cookie
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

      // Issue new access token
      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

}

exports.logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const token = req.cookies.otpToken;
    if (!token) return res.status(401).json({ message: "No token, please signup again" });

    // Find OTP record
    let decoded;           
    try {
       decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Use decoded.userId instead of email
    const otpRecord = await Otp.findOne({ userId: decoded.userId });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    // 5. Check OTP match
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if expired
    if (otpRecord.expiresAt < Date.now())
    {
        await Otp.deleteOne({ userId: decoded.userId });
        return res.status(400).json({ message: "OTP expired, request a new one" });
    }

     const deviceId = uuidv4();

      await User.findByIdAndUpdate(
        decoded.userId,
        { 
          verified: true,
          $push: { trustedDevices: { deviceId } } 
        },
        { new: true } // return updated doc if needed
      );

    // 7. Cleanup OTP & cookie
    await Otp.deleteOne({ userId: decoded.userId });
    res.clearCookie("otpToken");
    
    res.cookie("deviceId", deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
  });

    return res.status(200).json({ message: "Account verified successfully" });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};