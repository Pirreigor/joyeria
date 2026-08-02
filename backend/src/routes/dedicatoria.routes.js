const { Router } = require("express");

const { getDedicatoria, submitDedicatoria } = require("../controllers/dedicatoria.controller");

const router = Router();

router.get("/:token", getDedicatoria);
router.post("/:token", submitDedicatoria);

module.exports = router;
