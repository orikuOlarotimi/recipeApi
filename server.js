const express = require("express")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes")
const favoriteRoutes = require("./routes/favoriteRoutes");
const recipieRoutes = require("./routes/recipeRoutes")
const ratingRoutes = require("./routes/ratingRoutes")
const commentRoutes = require("./routes/commentRoutes")
const followRoutes = require("./routes/followRoutes")

const connectDB = require("./database/db");
dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/favorites", favoriteRoutes)
app.use("/api/recipie", recipieRoutes)
app.use("/api/rating", ratingRoutes)
app.use("/api/comment", commentRoutes)
app.use("/api/follow", followRoutes)

app.get("/", (req, res) => {
    return res.status(200).json({message:"connected sucessfully"})
} )

app.listen(PORT, async() => {
    console.log(`app running on ${PORT}`)
    await connectDB();
})