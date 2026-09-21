const { Router } = require("express");

const { listStoreCategories, listSlides, listFlyers, getStoreSettings } = require("../controllers/store.controller");
const { blockDuringMaintenance } = require("../middleware/maintenance.middleware");

const router = Router();

// /settings queda sin bloquear a proposito: el frontend lo consulta primero
// para saber si esta en mantenimiento, antes de pedir cualquier otra cosa.
router.get("/settings", getStoreSettings);

router.get("/categories", blockDuringMaintenance, listStoreCategories);
router.get("/slides", blockDuringMaintenance, listSlides);
router.get("/flyers", blockDuringMaintenance, listFlyers);

module.exports = router;
