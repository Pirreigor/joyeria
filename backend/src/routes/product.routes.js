const { Router } = require("express");

const { listProducts, getProductBySlug } = require("../controllers/product.controller");
const { blockDuringMaintenance } = require("../middleware/maintenance.middleware");

const router = Router();

router.use(blockDuringMaintenance);

router.get("/", listProducts);
router.get("/:slug", getProductBySlug);

module.exports = router;
