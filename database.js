const mongoose = require("mongoose");
const { mongoURL } = require("./config.json");

module.exports = {
  connect: async () => {
    try {
      await mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  },
};
