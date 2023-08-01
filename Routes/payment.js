const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middlewares/isAuthenticated");
const stripe = require("stripe")(process.env.STRIPE_SK);

const Offer = require("../Models/Offer");
const Transaction = require("../Models/Transaction");
const User = require("../Models/User");

const datefns = require("date-fns");

router.post("/pay", isAuthenticated, async (req, res) => {
  try {
    const stripeToken = req.body.stripeToken;
    console.log("stripe", stripeToken);
    console.log(req.body);

    const { productID, sellerID, total, name } = req.body;

    if (productID && sellerID && total && name && stripeToken) {
      const findBuyer = await User.findOne({ token: req.token });
      console.log("acheteur : ", findBuyer);
      try {
        if (findBuyer) {
          const findProduct = await Offer.findById(productID);
          console.log("product", findProduct);
          try {
            if (findProduct) {
              if (findProduct.bought === false) {
                const findSeller = await User.findById(sellerID);
                console.log("vendeur", findSeller);

                try {
                  if (findSeller) {
                    console.log("if");

                    console.log(stripeToken);
                    const totalAmount = Number(total) * 100;

                    const response = await stripe.charges.create({
                      amount: totalAmount,
                      currency: "eur",
                      description: name,
                      source: stripeToken,
                    });
                    console.log(response.status);

                    findProduct.bought = true;
                    await findProduct.save();

                    const newTransaction = new Transaction({
                      seller: findSeller,
                      buyer: findBuyer,
                      product: findProduct,
                      price: Number(total),
                      date: datefns.format(new Date(), "yyyy-MM-dd"),
                    });

                    await newTransaction.save();
                    res.status(200).json(response.status);
                  } else {
                    throw {
                      status: 400,
                      message: "the seller ID is not found",
                    };
                  }
                } catch (error) {
                  return res
                    .status(error.status || 500)
                    .json({ message: error.message });
                }
              } else {
                throw {
                  status: 400,
                  message: "The product has already sold",
                };
              }
            } else {
              throw {
                status: 400,
                message: "The product ID is not found",
              };
            }
          } catch (error) {
            return res
              .status(error.status || 500)
              .json({ message: error.message });
          }
        } else {
          throw {
            status: 400,
            message: "The buyer ID is not found",
          };
        }
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
