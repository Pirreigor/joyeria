const { Router } = require("express");

const { listStoreCategories, listSlides, listFlyers, getStoreSettings } = require("../controllers/store.controller");

const router = Router();

router.get("/categories", listStoreCategories);
router.get("/slides", listSlides);
router.get("/flyers", listFlyers);
router.get("/settings", getStoreSettings);

module.exports = router;
