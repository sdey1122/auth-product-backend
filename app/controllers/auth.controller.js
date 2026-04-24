const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

class AuthController {
  // REGISTER
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // VALIDATION (REGEX)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password min 6 chars" });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // LOGIN
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // ACCESS TOKEN
      const accessToken = generateToken({
        id: user._id,
        role: user.role,
      });

      // REFRESH TOKEN
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // SAVE REFRESH TOKEN IN DB
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        message: "Login successful",
        token: accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // REFRESH TOKEN
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const user = await User.findOne({ refreshToken });

      if (!user) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = generateToken({
        id: user._id,
        role: user.role,
      });

      res.json({
        token: newAccessToken,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // LOGOUT
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token required" });
      }

      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
