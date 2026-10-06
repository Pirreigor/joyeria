const { Router } = require("express");

const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStoreSettings,
  updateStoreSettings,
  getMaintenanceStatus,
  setMaintenanceStatus,
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
  exportInventory,
  getDashboard,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  sendUserPasswordReset,
  createManualOrder,
  updateNotaPedido,
  listOrders,
  exportOrders,
  updateOrderStatus,
  updateOrderItemPrices,
  updateCotizacion,
  confirmPayment,
  listOrderDedicatorias,
} = require("../controllers/admin.controller");
const { uploadImage, exportTemplate, importProducts } = require("../controllers/import.controller");
const {
  listTalleres, createTaller, updateTaller, deleteTaller, updateOrderTallerEtapa,
  createTallerUsuario, deleteTallerUsuario,
} = require("../controllers/taller.controller");
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
const { requireRole, requirePermission, requireAnyPermission, requireSuperAdmin } = require("../middleware/role.middleware");
const { blockAdminDuringMaintenance } = require("../middleware/maintenance.middleware");
const { uploadComprobante } = require("../middleware/upload.middleware");
const { uploadImage: uploadImageMiddleware, uploadImportFiles } = require("../middleware/uploadImage.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMINISTRADOR", "VENDEDOR"), blockAdminDuringMaintenance);

// Vista de emergencia: solo la cuenta admin@joyeria.local puede ver y accionar
// el switch de mantenimiento, para que nadie mas pueda activarlo ni desactivarlo.
router.get("/maintenance", requireSuperAdmin, getMaintenanceStatus);
router.patch("/maintenance", requireSuperAdmin, setMaintenanceStatus);

router.get("/dashboard", requirePermission("dashboard"), getDashboard);

router.get("/users", requirePermission("users"), listUsers);
router.post("/users", requirePermission("users"), createUser);
router.patch("/users/:id", requirePermission("users"), updateUser);
router.delete("/users/:id", requirePermission("users"), deleteUser);
router.post("/users/:id/password-reset", requirePermission("users"), sendUserPasswordReset);

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

router.post("/upload-image", requireAnyPermission("products", "categories", "slides", "flyers", "taller"), uploadImageMiddleware, uploadImage);
router.get("/products/export-template", requirePermission("products"), exportTemplate);
router.get("/products/export-inventory", requireRole("ADMINISTRADOR"), exportInventory);
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

router.get("/orders", requireAnyPermission("orders", "despacho", "clientes", "envios", "historial", "taller"), listOrders);
router.get("/orders/export", requireAnyPermission("orders", "despacho", "clientes", "envios", "historial"), exportOrders);
router.post("/orders/manual", requirePermission("orders"), createManualOrder);
router.post("/orders/:id/confirm-payment", requirePermission("orders"), uploadComprobante, confirmPayment);
router.patch("/orders/:id/status", requireAnyPermission("orders", "despacho", "envios", "taller"), updateOrderStatus);
router.patch("/orders/:id/items", requirePermission("orders"), updateOrderItemPrices);
router.patch("/orders/:id/cotizacion", requirePermission("orders"), updateCotizacion);
router.patch("/orders/:id/taller-etapa", requirePermission("taller"), updateOrderTallerEtapa);

router.get("/talleres", requireAnyPermission("taller", "orders"), listTalleres);
router.post("/talleres", requirePermission("taller"), createTaller);
router.patch("/talleres/:id", requirePermission("taller"), updateTaller);
router.delete("/talleres/:id", requirePermission("taller"), deleteTaller);
router.post("/talleres/:id/usuarios", requirePermission("taller"), createTallerUsuario);
router.delete("/talleres/:id/usuarios/:userId", requirePermission("taller"), deleteTallerUsuario);
router.patch("/orders/:id/nota-pedido", requirePermission("orders"), updateNotaPedido);
router.get("/orders/:id/dedicatorias", requireAnyPermission("orders", "despacho", "envios"), listOrderDedicatorias);

module.exports = router;
