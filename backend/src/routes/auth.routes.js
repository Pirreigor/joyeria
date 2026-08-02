const { Router } = require("express");

const { register, login, me, getInvitation, acceptInvitation } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/invitations/:token", getInvitation);
router.post("/accept-invitation", acceptInvitation);

module.exports = router;
