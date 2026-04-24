const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/", require("./user.routes"));
router.use("/products", require("./product.routes"));

module.exports = router;
