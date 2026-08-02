const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { sendInvitationEmail } = require("../utils/mail");

const ROLES_VALIDOS = ["ADMINISTRADOR", "VENDEDOR", "CLIENTE"];
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function buildInviteUrl(token) {
  const base = process.env.ADMIN_APP_URL || "http://localhost:5175";
  return `${base}/?invite=${token}`;
}

async function createInvitation(req, res) {
  const { name, email, role, permissions } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "name y email son obligatorios" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = role ? String(role).trim().toUpperCase() : "ADMINISTRADOR";

  if (!ROLES_VALIDOS.includes(normalizedRole)) {
    return res.status(400).json({ message: "Rol invalido" });
  }

  const existingUser = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(409).json({ message: "El email ya esta en uso" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const permisos = Array.isArray(permissions) ? permissions.filter((p) => typeof p === "string") : [];

  const pending = await prisma.invitacionUsuario.findFirst({
    where: { email: normalizedEmail, acceptedAt: null },
  });

  const invitation = pending
    ? await prisma.invitacionUsuario.update({
        where: { id: pending.id },
        data: {
          name: String(name).trim(),
          rol: normalizedRole,
          permisos,
          token,
          expiresAt,
          invitedByName: req.user?.email || null,
        },
      })
    : await prisma.invitacionUsuario.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          rol: normalizedRole,
          permisos,
          token,
          expiresAt,
          invitedByName: req.user?.email || null,
        },
      });

  await sendInvitationEmail({
    to: invitation.email,
    name: invitation.name,
    inviteUrl: buildInviteUrl(invitation.token),
  });

  return res.status(201).json({ invitation });
}

async function listInvitations(req, res) {
  const invitations = await prisma.invitacionUsuario.findMany({
    where: { acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ invitations });
}

async function revokeInvitation(req, res) {
  const { id } = req.params;

  const existing = await prisma.invitacionUsuario.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Invitacion no encontrada" });
  }

  await prisma.invitacionUsuario.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

async function resendInvitation(req, res) {
  const { id } = req.params;

  const existing = await prisma.invitacionUsuario.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ message: "Invitacion no encontrada" });
  }
  if (existing.acceptedAt) {
    return res.status(409).json({ message: "La invitacion ya fue aceptada" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  const invitation = await prisma.invitacionUsuario.update({
    where: { id: existing.id },
    data: { token, expiresAt },
  });

  await sendInvitationEmail({
    to: invitation.email,
    name: invitation.name,
    inviteUrl: buildInviteUrl(invitation.token),
  });

  return res.json({ invitation });
}

module.exports = {
  createInvitation,
  listInvitations,
  revokeInvitation,
  resendInvitation,
};
