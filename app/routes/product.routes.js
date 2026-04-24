const router = require("express").Router();
const controller = require("../controllers/product.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.post("/", auth, upload.single("image"), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", auth, upload.single("image"), controller.update);

router.delete("/:id", auth, controller.softDelete);
router.patch("/:id/restore", auth, controller.restore);
router.delete("/:id/force", auth, controller.forceDelete);

module.exports = router;
