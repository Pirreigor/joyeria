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

// permisos vacío = acceso total, pero solo para ADMINISTRADOR (superadmin).
// Para otros roles (ej. VENDEDOR), vacío = sin acceso a ninguna seccion.
function requirePermission(perm) {
  return requireAnyPermission(perm);
}

// Permite el acceso si el usuario tiene al menos uno de los permisos indicados.
// Util para rutas compartidas por varias pestanas del admin (ej. pedidos, que
// usan Pedidos/Despacho/Clientes/Envios).
function requireAnyPermission(...perms) {
  return (req, res, next) => {
    const permisos = req.user?.permisos || [];
    if (req.user?.rol === "ADMINISTRADOR" && permisos.length === 0) return next();
    if (perms.some((perm) => permisos.includes(perm))) return next();
    return res.status(403).json({ message: "Sin permiso para esta seccion" });
  };
}

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
};
