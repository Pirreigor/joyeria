const { Router } = require("express");

const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStoreSettings,
  updateStoreSettings,
  listSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  listFlyers,
  createFlyer,
  updateFlyer,
  deleteFlyer,
  createProduct,
  updateProduct,
  listProducts,
  deleteProduct,
  getDashboard,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listOrders,
  updateOrderStatus,
  confirmPayment,
} = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole, requirePermission } = require("../middleware/role.middleware");
const { uploadComprobante } = require("../middleware/upload.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMINISTRADOR"));

router.get("/dashboard", requirePermission("dashboard"), getDashboard);

router.get("/users", requirePermission("users"), listUsers);
router.post("/users", requirePermission("users"), createUser);
router.patch("/users/:id", requirePermission("users"), updateUser);
router.delete("/users/:id", requirePermission("users"), deleteUser);

router.get("/settings", requirePermission("settings"), getStoreSettings);
router.patch("/settings", requirePermission("settings"), updateStoreSettings);

router.get("/categories", requirePermission("categories"), listCategories);
router.post("/categories", requirePermission("categories"), createCategory);
router.patch("/categories/:id", requirePermission("categories"), updateCategory);
router.delete("/categories/:id", requirePermission("categories"), deleteCategory);

router.get("/slides", requirePermission("slides"), listSlides);
router.post("/slides", requirePermission("slides"), createSlide);
router.patch("/slides/:id", requirePermission("slides"), updateSlide);
router.delete("/slides/:id", requirePermission("slides"), deleteSlide);

router.get("/flyers", requirePermission("flyers"), listFlyers);
router.post("/flyers", requirePermission("flyers"), createFlyer);
router.patch("/flyers/:id", requirePermission("flyers"), updateFlyer);
router.delete("/flyers/:id", requirePermission("flyers"), deleteFlyer);

router.get("/products", requirePermission("products"), listProducts);
router.post("/products", requirePermission("products"), createProduct);
router.patch("/products/:id", requirePermission("products"), updateProduct);
router.delete("/products/:id", requirePermission("products"), deleteProduct);

router.get("/orders", requirePermission("orders"), listOrders);
router.post("/orders/:id/confirm-payment", requirePermission("orders"), uploadComprobante, confirmPayment);
router.patch("/orders/:id/status", requirePermission("orders"), updateOrderStatus);

module.exports = router;
