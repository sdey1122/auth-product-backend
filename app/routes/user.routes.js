const router = require("express").Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, controller.updateProfile);
router.put(
  "/profile/image",
  auth,
  upload.single("image"),
  controller.updateImage,
);

module.exports = router;
