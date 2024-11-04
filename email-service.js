// replace this with your mailgun domain
const MAILGUN_DOMAIN = "sandboxc1f5d6428e5947d6b633ce6cf7ba27ef.mailgun.org";
const RESEND_DOMAIN = "tilde-thurium.dev";

const EMAIL_TEMPLATES = {
  PASSWORD_RESET: {
    subject: "Reset Your Password",
    html: `
      <h1>Password Reset Request</h1>
      <p>Hello!</p>
      <p>We received a request to reset your password for Tilde's Cupcake Shoppe.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="http://localhost:3000/reset-password">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,<br>Tilde's Cupcake Shoppe Team</p>
    `,
  },
};

const EMAIL_CONFIG = {
  MAILGUN_DOMAIN,
  MAILGUN_FROM: `Tilde's Cupcake Shoppe <mailgun@${MAILGUN_DOMAIN}>`,
  RESEND_FROM: `Tilde's Cupcake Shoppe <password-reset@${RESEND_DOMAIN}>`,
};

class EmailService {
  constructor(mailgunClient, resendClient) {
    this.mailgun = mailgunClient;
    this.resend = resendClient;
  }

  async sendPasswordReset(email, provider = "mailgun") {
    const template = EMAIL_TEMPLATES.PASSWORD_RESET;
    let result;
    if (provider === "resend") {
      result = await this.sendWithResend(email, template);
    } else {
      result = await this.sendWithMailgun(email, template);
    }
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  async sendWithMailgun(email, template) {
    try {
      const data = await this.mailgun.messages.create(
        EMAIL_CONFIG.MAILGUN_DOMAIN,
        {
          from: EMAIL_CONFIG.MAILGUN_FROM,
          to: [email],
          subject: template.subject,
          html: template.html,
        }
      );
      return { success: true, data };
    } catch (error) {
      console.error("Mailgun error:", error);
      return { success: false, error };
    }
  }

  async sendWithResend(email, template) {
    try {
      const data = await this.resend.emails.send({
        from: EMAIL_CONFIG.RESEND_FROM,
        to: email,
        subject: template.subject,
        html: template.html,
      });
      return { success: true, data };
    } catch (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }
  }
}

module.exports = EmailService;
