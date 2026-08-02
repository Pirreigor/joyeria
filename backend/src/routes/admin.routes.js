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
  listOrderDedicatorias,
} = require("../controllers/admin.controller");
const { uploadImage, exportTemplate, importProducts } = require("../controllers/import.controller");
const {
  createInvitation,
  listInvitations,
  revokeInvitation,
  resendInvitation,
} = require("../controllers/invitation.controller");
const {
  listTiposPieza, createTipoPieza, updateTipoPieza, deleteTipoPieza,
  listMateriales, createMaterial, updateMaterial, deleteMaterial,
  listGemas, createGema, updateGema, deleteGema,
  listOrigenesGema, createOrigenGema, updateOrigenGema, deleteOrigenGema,
  findProductBySku,
} = require("../controllers/catalog.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole, requirePermission } = require("../middleware/role.middleware");
const { uploadComprobante } = require("../middleware/upload.middleware");
const { uploadImage: uploadImageMiddleware, uploadImportFiles } = require("../middleware/uploadImage.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMINISTRADOR", "VENDEDOR"));

router.get("/dashboard", requirePermission("dashboard"), getDashboard);

router.get("/users", requirePermission("users"), listUsers);
router.post("/users", requirePermission("users"), createUser);
router.patch("/users/:id", requirePermission("users"), updateUser);
router.delete("/users/:id", requirePermission("users"), deleteUser);

router.get("/invitations", requirePermission("users"), listInvitations);
router.post("/invitations", requirePermission("users"), createInvitation);
router.post("/invitations/:id/resend", requirePermission("users"), resendInvitation);
router.delete("/invitations/:id", requirePermission("users"), revokeInvitation);

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
router.get("/products/by-sku/:sku", requirePermission("products"), findProductBySku);

router.post("/upload-image", requirePermission("products"), uploadImageMiddleware, uploadImage);
router.get("/products/export-template", requirePermission("products"), exportTemplate);
router.post("/products/import", requirePermission("products"), uploadImportFiles, importProducts);

router.get("/tipos-pieza", requirePermission("atributos"), listTiposPieza);
router.post("/tipos-pieza", requirePermission("atributos"), createTipoPieza);
router.patch("/tipos-pieza/:id", requirePermission("atributos"), updateTipoPieza);
router.delete("/tipos-pieza/:id", requirePermission("atributos"), deleteTipoPieza);

router.get("/materiales", requirePermission("atributos"), listMateriales);
router.post("/materiales", requirePermission("atributos"), createMaterial);
router.patch("/materiales/:id", requirePermission("atributos"), updateMaterial);
router.delete("/materiales/:id", requirePermission("atributos"), deleteMaterial);

router.get("/gemas", requirePermission("atributos"), listGemas);
router.post("/gemas", requirePermission("atributos"), createGema);
router.patch("/gemas/:id", requirePermission("atributos"), updateGema);
router.delete("/gemas/:id", requirePermission("atributos"), deleteGema);

router.get("/origenes-gema", requirePermission("atributos"), listOrigenesGema);
router.post("/origenes-gema", requirePermission("atributos"), createOrigenGema);
router.patch("/origenes-gema/:id", requirePermission("atributos"), updateOrigenGema);
router.delete("/origenes-gema/:id", requirePermission("atributos"), deleteOrigenGema);

router.get("/orders", requirePermission("orders"), listOrders);
router.post("/orders/:id/confirm-payment", requirePermission("orders"), uploadComprobante, confirmPayment);
router.patch("/orders/:id/status", requirePermission("orders"), updateOrderStatus);
router.get("/orders/:id/dedicatorias", requirePermission("orders"), listOrderDedicatorias);

module.exports = router;
