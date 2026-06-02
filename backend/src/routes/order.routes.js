const { Router } = require("express");

const { createOrder, listMyOrders } = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, listMyOrders);

module.exports = router;
