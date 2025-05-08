const axios = require("axios");
const jwt = require("jsonwebtoken");
const { oauth2Client } = require("../utils/googleClient");
const User = require("../models/userModel");

/* GET Google Authentication API. */
const googleAuth = async (req, res, next) => {
  const code = req.query.code;

  try {
    // Exchange authorization code for tokens
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    // Fetch user info from Google
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { id: googleId, email, name, picture } = userRes.data;

    if (!email) {
      return res.status(400).json({
        message: "Google account doesn't have an email address",
      });
    }

    // Check if user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Case 1: User doesn't exist - create new user with Google ID
      user = await User.create({
        googleId,
        fullName: name,
        email,
        picture,
        role: "hr",
      });
    } else if (!user.googleId) {
      // Case 2: User exists but doesn't have Google ID - update with Google ID
      user.googleId = googleId;
      if (!user.picture) user.picture = picture;
      if (!user.fullName) user.fullName = name;
      await user.save();
    }
    // Case 3: User exists and has Google ID - proceed without changes

    // Generate JWT token
    const { _id, role } = user;
    const token = jwt.sign({ id: _id, email, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT || "1h",
    });

    // Respond with token and user info
    res.status(200).json({
      message: "success",
      token,
      user,
    });
  } catch (err) {
    console.error("Google Authentication Error:", err.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = { googleAuth };
