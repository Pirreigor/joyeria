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
} = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/settings", getStoreSettings);
router.patch("/settings", updateStoreSettings);

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/slides", listSlides);
router.post("/slides", createSlide);
router.patch("/slides/:id", updateSlide);
router.delete("/slides/:id", deleteSlide);

router.get("/flyers", listFlyers);
router.post("/flyers", createFlyer);
router.patch("/flyers/:id", updateFlyer);
router.delete("/flyers/:id", deleteFlyer);

router.get("/products", listProducts);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;
