const mongoose = require('mongoose')


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // optional configs (modern versions don’t need most of these)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;