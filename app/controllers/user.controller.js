const User = require("../models/user.model");

class UserController {
  async getProfile(req, res) {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  }

  async updateProfile(req, res) {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });

    res.json(user);
  }

  async updateImage(req, res) {
    const image = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: image },
      { new: true },
    );

    res.json(user);
  }
}

module.exports = new UserController();
