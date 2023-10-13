const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: Array,
  exchange: Boolean,
  bought: { type: Boolean, default: false },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  owner_connect: Boolean,
  seller_connect: { type: Boolean, default: false },
});

module.exports = Offer;
