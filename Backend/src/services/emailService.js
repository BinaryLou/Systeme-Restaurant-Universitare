const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Restaurant Universitaire" <noreply@ru-digital.com>',
    to: toEmail,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Restaurant Universitaire.</p>
        <p>Veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p>Ou copiez/collez ce lien dans votre navigateur : <br/>
        <a href="${resetUrl}">${resetUrl}</a></p>
        <p>Ce lien expirera dans ${process.env.RESET_TOKEN_TTL_MINUTES || 15} minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br/>L'équipe Restaurant Universitaire</p>
      </div>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP_USER ou SMTP_PASS non défini. L'email ne sera pas réellement envoyé.");
    console.log("📨 Simulation d'envoi d'email à :", toEmail);
    console.log("🔗 Lien de réinitialisation :", resetUrl);
    return true; // Simule un envoi réussi
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé : %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Impossible d'envoyer l'email de réinitialisation.");
  }
};

module.exports = {
  sendResetPasswordEmail,
};
