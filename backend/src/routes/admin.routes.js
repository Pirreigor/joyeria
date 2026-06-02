const { Router } = require("express");

const {
  createProduct,
  updateProduct,
  listOrders,
  updateOrderStatus,
} = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;
