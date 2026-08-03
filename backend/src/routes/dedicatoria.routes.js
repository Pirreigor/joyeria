const { Router } = require("express");

const { getDedicatoria, submitDedicatoria, buscarPedido } = require("../controllers/dedicatoria.controller");

const router = Router();

router.get("/buscar/:pedidoId", buscarPedido);
router.get("/:token", getDedicatoria);
router.post("/:token", submitDedicatoria);

module.exports = router;
