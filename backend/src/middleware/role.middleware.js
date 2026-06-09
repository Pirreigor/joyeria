function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    return next();
  };
}

// permisos vacío = acceso total (superadmin)
function requirePermission(perm) {
  return (req, res, next) => {
    const permisos = req.user?.permisos || [];
    if (permisos.length === 0 || permisos.includes(perm)) return next();
    return res.status(403).json({ message: "Sin permiso para esta seccion" });
  };
}

module.exports = {
  requireRole,
  requirePermission,
};
