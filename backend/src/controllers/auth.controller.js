const prisma = require("../utils/prisma");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signAccessToken } = require("../utils/jwt");
const { isSuperAdmin } = require("../utils/superAdmin");
const { hashToken, enviarCorreoCambioPassword } = require("../utils/passwordReset");

async function getInvitation(req, res) {
  const { token } = req.params;

  const invitation = await prisma.invitacionUsuario.findUnique({ where: { token } });
  if (!invitation) {
    return res.status(404).json({ message: "Invitacion no encontrada" });
  }
  if (invitation.acceptedAt) {
    return res.status(410).json({ message: "La invitacion ya fue utilizada" });
  }
  if (invitation.expiresAt < new Date()) {
    return res.status(410).json({ message: "La invitacion expiro" });
  }

  return res.json({
    invitation: {
      email: invitation.email,
      name: invitation.name,
      rol: invitation.rol,
    },
  });
}

async function acceptInvitation(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "token y password son obligatorios" });
  }

  const invitation = await prisma.invitacionUsuario.findUnique({ where: { token } });
  if (!invitation) {
    return res.status(404).json({ message: "Invitacion no encontrada" });
  }
  if (invitation.acceptedAt) {
    return res.status(410).json({ message: "La invitacion ya fue utilizada" });
  }
  if (invitation.expiresAt < new Date()) {
    return res.status(410).json({ message: "La invitacion expiro" });
  }

  const existing = await prisma.usuario.findUnique({ where: { email: invitation.email } });
  if (existing) {
    return res.status(409).json({ message: "El email ya esta en uso" });
  }

  const passwordHash = await hashPassword(String(password));

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.usuario.create({
      data: {
        name: invitation.name,
        email: invitation.email,
        passwordHash,
        rol: invitation.rol,
        permisos: invitation.permisos,
        tallerId: invitation.tallerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        rol: true,
        permisos: true,
      },
    });

    await tx.invitacionUsuario.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return created;
  });

  const accessToken = signAccessToken({ id: user.id, rol: user.rol, email: user.email, permisos: user.permisos });

  return res.status(201).json({ user, token: accessToken });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email y password son obligatorios" });
  }

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "El email ya esta en uso" });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.usuario.create({
    data: {
      name,
      email,
      passwordHash,
      rol: "CLIENTE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
    },
  });

  const token = signAccessToken({ id: user.id, rol: user.rol, email: user.email, permisos: [] });

  return res.status(201).json({ user: { ...user, permisos: [] }, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son obligatorios" });
  }

  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  if (!isSuperAdmin(user)) {
    const config = await prisma.configTienda.findUnique({ where: { id: 1 }, select: { mantenimiento: true } });
    if (config?.mantenimiento) {
      return res.status(503).json({ message: "El sitio esta en mantenimiento. Volve a intentarlo mas tarde.", maintenance: true });
    }
  }

  const token = signAccessToken({ id: user.id, rol: user.rol, email: user.email, permisos: user.permisos });

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      permisos: user.permisos,
    },
    token,
  });
}

async function requestPasswordReset(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const respuesta = { message: "Si el email corresponde a una cuenta, te enviamos un correo para cambiar la contrasena." };

  if (!email) return res.json(respuesta);

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (usuario && usuario.rol !== "CLIENTE") {
    try {
      await enviarCorreoCambioPassword(usuario);
    } catch (error) {
      console.error("No se pudo enviar el correo de cambio de contrasena:", error.message);
    }
  }

  return res.json(respuesta);
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password || String(password).length < 6) {
    return res.status(400).json({ message: "El enlace es invalido o la contrasena tiene menos de 6 caracteres" });
  }

  const usuario = await prisma.usuario.findFirst({
    where: { resetTokenHash: hashToken(String(token)), resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!usuario) {
    return res.status(400).json({ message: "El enlace no es valido o ya expiro. Pedi uno nuevo." });
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      passwordHash: await hashPassword(String(password)),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  return res.json({ message: "Contrasena actualizada. Ya podes iniciar sesion." });
}

async function me(req, res) {
  const user = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      permisos: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json({ user });
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  me,
  getInvitation,
  acceptInvitation,
};
