const { Router } = require("express");

const { createOrder, checkout, listMyOrders } = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { blockDuringMaintenance } = require("../middleware/maintenance.middleware");

const router = Router();

router.use(blockDuringMaintenance);

router.post("/checkout", checkout);
router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, listMyOrders);

module.exports = router;
