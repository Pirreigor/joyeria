const { Router } = require("express");

const { getDedicatoria, submitDedicatoria, buscarPedido, guardarDedicatoriaPedido, verDedicatoriaCompartida } = require("../controllers/dedicatoria.controller");

const router = Router();

router.get("/buscar/:pedidoId", buscarPedido);
router.post("/pedido/:pedidoId", guardarDedicatoriaPedido);
router.get("/ver/:token", verDedicatoriaCompartida);
router.get("/:token", getDedicatoria);
router.post("/:token", submitDedicatoria);

module.exports = router;
