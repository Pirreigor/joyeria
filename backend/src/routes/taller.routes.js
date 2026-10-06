const { Router } = require("express");

const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { blockAdminDuringMaintenance } = require("../middleware/maintenance.middleware");
const { uploadImage: uploadImageMiddleware } = require("../middleware/uploadImage.middleware");
const { uploadImage } = require("../controllers/import.controller");
const {
  requireTallerUser,
  listPedidosTaller,
  cambiarEtapaTaller,
  marcarListoTaller,
} = require("../controllers/tallerPortal.controller");

const router = Router();

router.use(requireAuth, requireRole("TALLER"), blockAdminDuringMaintenance, requireTallerUser);

router.get("/pedidos", listPedidosTaller);
router.patch("/pedidos/:id/etapa", cambiarEtapaTaller);
router.patch("/pedidos/:id/listo", marcarListoTaller);
router.post("/upload-image", uploadImageMiddleware, uploadImage);

module.exports = router;
