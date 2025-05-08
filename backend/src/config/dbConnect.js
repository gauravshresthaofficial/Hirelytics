const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load appropriate .env file
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production", override: true });

  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Loaded DB string:", process.env.CONNECTION_STRING);
} else {
  dotenv.config();
}

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);

    console.log(`Database connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbConnect;
