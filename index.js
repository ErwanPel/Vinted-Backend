require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const userRoutes = require("./Routes/user");
const offerRoutes = require("./Routes/offer");
const adminRoutes = require("./Routes/admin");

app
  .use(express.json())
  .use(cors())
  .use(userRoutes)
  .use(offerRoutes)
  .use(adminRoutes);

app.get("/", (req, res) => {
  try {
    return res.status(200).json({ message: "Welcome on Vinted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  try {
    res.status(404).json({ message: "Page not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server has started at port " + PORT);
});
