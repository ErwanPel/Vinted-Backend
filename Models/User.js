const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: { type: String, unique: true },
  account: {
    username: String,
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
