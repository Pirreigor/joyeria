const prisma = require("../utils/prisma");

const MAINTENANCE_MESSAGE = "El sitio esta en mantenimiento. Volve a intentarlo mas tarde.";

async function blockDuringMaintenance(req, res, next) {
  const config = await prisma.configTienda.findUnique({ where: { id: 1 }, select: { mantenimiento: true } });
  if (config?.mantenimiento) {
    return res.status(503).json({ message: MAINTENANCE_MESSAGE, maintenance: true });
  }
  return next();
}

module.exports = {
  blockDuringMaintenance,
  MAINTENANCE_MESSAGE,
};
