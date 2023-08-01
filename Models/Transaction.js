const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  date: { type: String, required: true },
  price: { type: Number },
});

module.exports = Transaction;
