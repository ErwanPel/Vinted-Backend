const SHA256 = require("crypto-js/sha256");
const Base64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const isAuthenticated = require("../Middlewares/isAuthenticated");

const express = require("express");
const router = express.Router();

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dtiqq9jgx",
  api_key: "956926296135563",
  api_secret: "bM0D30YRty7nNdtZYqi2LG2ouHQ",
});

const convertToBase64 = require("../Utils/convertToBase64");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const Offer = require("../Models/Offer");

// This root sign a new user who can save a picture for the profil's picture
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    if (username && email && password && newsletter !== undefined) {
      const salt = uid2(32);
      const hash = SHA256(password + salt).toString(Base64);
      const token = uid2(32);

      const userToCreate = new User({
        email,
        account: {
          username,
          avatar: "none",
        },
        newsletter,
        token,
        hash,
        salt,
      });
      if (req.files) {
        const pictureToUp = req.files.picture;

        const result = cloudinary.uploader.upload(
          convertToBase64(pictureToUp),
          {
            public_id: pictureToUp.name,
            folder: `/vinted/users/${userToCreate._id}`,
          }
        );
        userToCreate.account.avatar = (await result).secure_url;

        await userToCreate.save();
        return res.status(201).json({
          _id: userToCreate._id,
          token: userToCreate.token,
          account: {
            username: userToCreate.account.username,
            avatar: (await result).secure_url,
          },
        });
      }

      await userToCreate.save();
      return res.status(201).json({
        _id: userToCreate._id,
        token: userToCreate.token,
        account: {
          username: userToCreate.account.username,
          avatar: "none",
        },
      });
    } else {
      throw { status: 400, message: "Missing parameters" };
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// This root connect the user in the site web
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userToFound = await User.findOne({ email });
    if (userToFound) {
      const hashUser = SHA256(password + userToFound.salt).toString(Base64);
      if (hashUser === userToFound.hash) {
        return res.status(200).json({
          _id: userToFound._id,
          token: userToFound.token,
          account: {
            username: userToFound.account.username,
            avatar: userToFound.account.avatar,
          },
        });
      } else {
        throw { status: 400, message: "email or password incorrect" };
      }
    } else {
      throw { status: 400, message: "email or password incorrect" };
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// This root send the purchase's data of the user
router.get("/user/buy", isAuthenticated, async (req, res) => {
  try {
    const findUser = await User.findOne({ token: req.token });
    const UserId = findUser._id;
    const getBuy = await Transaction.find({ buyer: UserId });

    let getOffer = [];

    for (let i = 0; i < getBuy.length; i++) {
      let productID = getBuy[i].product;
      let product = await Offer.findById(productID).populate({
        path: "owner",
        select: "account",
      });
      getOffer.push({ product, date: getBuy[i].date });
    }
    const count = getOffer.length;
    if (count === 0) {
      throw { status: 400, message: "No buy is found" };
    } else {
      res.status(200).json({ count, getOffer });
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// This root send the sales's data of the user
router.get("/user/sold", isAuthenticated, async (req, res) => {
  try {
    const findUser = await User.findOne({ token: req.token });
    const UserId = findUser._id;
    const getSell = await Transaction.find({ seller: UserId });

    let getOffer = [];

    for (let i = 0; i < getSell.length; i++) {
      let productID = getSell[i].product;
      let buyerID = getSell[i].buyer;
      let product = await Offer.findById(productID);
      let buy = await User.findById(buyerID);

      getOffer.push({ product, buyer: buy.account, date: getSell[i].date });
    }
    const count = getOffer.length;
    if (count === 0) {
      throw { status: 400, message: "No sell is found" };
    } else {
      res.status(200).json({ count, getOffer });
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
