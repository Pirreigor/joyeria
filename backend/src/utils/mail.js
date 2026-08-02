const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendInvitationEmail({ to, name, inviteUrl }) {
  if (!resend) {
    throw new Error("RESEND_API_KEY no esta configurado");
  }

  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM,
    to,
    subject: "Invitacion al panel de Don Joyero",
    html: `
      <p>Hola ${name},</p>
      <p>Fuiste invitado a sumarte al panel de administracion de Don Joyero.</p>
      <p><a href="${inviteUrl}">Completa tu registro aca</a> para elegir tu contrasena.</p>
      <p>Este link expira en 7 dias.</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "No se pudo enviar el correo de invitacion");
  }
}

module.exports = {
  sendInvitationEmail,
};
