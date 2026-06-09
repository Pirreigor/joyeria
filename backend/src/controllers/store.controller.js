const prisma = require("../utils/prisma");

async function listStoreCategories(req, res) {
  const categories = await prisma.categoria.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      bannerImageUrl: true,
    },
  });

  return res.json({ categories });
}

async function getStoreSettings(req, res) {
  const settings = await prisma.configTienda.findUnique({ where: { id: 1 } });

  if (!settings) {
    return res.json({
      settings: {
        brandName: "Don Joyero",
        logoUrl: null,
        promoVideoUrl: null,
        promoVideoTitle: null,
      },
    });
  }

  return res.json({ settings });
}

async function listSlides(req, res) {
  const slides = await prisma.slide.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    take: 3,
  });

  return res.json({ slides });
}

async function listFlyers(req, res) {
  const flyers = await prisma.flyer.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });

  return res.json({ flyers });
}

module.exports = {
  listStoreCategories,
  listSlides,
  listFlyers,
  getStoreSettings,
};
