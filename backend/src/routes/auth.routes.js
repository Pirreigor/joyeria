const { Router } = require("express");

const { register, login, me, getInvitation, acceptInvitation } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { blockDuringMaintenance } = require("../middleware/maintenance.middleware");

const router = Router();

// login queda sin el guard generico: adentro del controller se deja pasar a
// ADMINISTRADOR/VENDEDOR aunque el sitio este en mantenimiento, y se bloquea
// solo a CLIENTE. El registro de clientes nuevos si se bloquea entero.
router.post("/register", blockDuringMaintenance, register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/invitations/:token", getInvitation);
router.post("/accept-invitation", acceptInvitation);

module.exports = router;
