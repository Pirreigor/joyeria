const { verifyAccessToken } = require("../utils/jwt");
const prisma = require("../utils/prisma");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const payload = verifyAccessToken(token);
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id }, select: { activo: true } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: "Tu cuenta fue desactivada. Contacta a un administrador." });
    }
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

module.exports = {
  requireAuth,
};
