const crypto = require("crypto");
const prisma = require("./prisma");
const { sendPasswordResetEmail } = require("./mail");

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function enviarCorreoCambioPassword(usuario) {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { resetTokenHash: hashToken(token), resetTokenExpiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  const base = process.env.ADMIN_APP_URL || "http://localhost:5175";
  await sendPasswordResetEmail({ to: usuario.email, name: usuario.name, resetUrl: `${base}/?reset=${token}` });
}

module.exports = { hashToken, enviarCorreoCambioPassword };
