const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/PasswordManager", {
  useNewUrlParser: true,
});

const blockSchema = new mongoose.Schema({
  username: String,
  myblocks: [],
});

const Ownedblock = mongoose.model("Block", blockSchema);

module.exports = Ownedblock;
