const prisma = require("../utils/prisma");
const { isSuperAdmin } = require("../utils/superAdmin");

const MAINTENANCE_MESSAGE = "El sitio esta en mantenimiento. Volve a intentarlo mas tarde.";

async function blockDuringMaintenance(req, res, next) {
  const config = await prisma.configTienda.findUnique({ where: { id: 1 }, select: { mantenimiento: true } });
  if (config?.mantenimiento) {
    return res.status(503).json({ message: MAINTENANCE_MESSAGE, maintenance: true });
  }
  return next();
}

// Se aplica dentro del ERP (despues de requireAuth): durante el mantenimiento,
// solo la cuenta super admin (admin@joyeria.local) puede seguir usando el panel,
// para que sea la unica capaz de desactivar el modo mantenimiento.
async function blockAdminDuringMaintenance(req, res, next) {
  const config = await prisma.configTienda.findUnique({ where: { id: 1 }, select: { mantenimiento: true } });
  if (config?.mantenimiento && !isSuperAdmin(req.user)) {
    return res.status(503).json({ message: MAINTENANCE_MESSAGE, maintenance: true });
  }
  return next();
}

module.exports = {
  blockDuringMaintenance,
  blockAdminDuringMaintenance,
  MAINTENANCE_MESSAGE,
};
