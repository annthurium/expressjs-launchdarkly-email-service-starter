const express = require("express");
const path = require("path");
require("dotenv").config();
const serveStatic = require("serve-static");
const launchDarkly = require("@launchdarkly/node-server-sdk");
const bodyParser = require("body-parser");

const app = express();

app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmailWithResend(email) {
  try {
    const data = await resend.emails.send({
      from: "Tilde's Cupcake Shoppe <password-reset@tilde-thurium.dev>",
      to: email,
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
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

app.post("/reset-password", async (req, res) => {
  const email = req.body.email;
  console.log("email", email);
  const emailData = await sendPasswordResetEmailWithResend(email);
  console.log(emailData);
  res.status(200).json({
    message: "Check your email inbox for password reset instructions.",
  });
});

// Initialize the LaunchDarkly client
const ldClient = launchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

// Add the waitForInitialization function to ensure the client is ready before starting the server
const timeoutInSeconds = 5;
ldClient.waitForInitialization({ timeout: timeoutInSeconds }).then(() => {
  const port = 3000;
  const server = app.listen(port, function (err) {
    if (err) console.log("Error in server setup");
    console.log(`Server listening on http://localhost:${port}`);
  });
});

// Add the following new function to gracefully close the connection to the LaunchDarkly server.
process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  ld.close();
  server.close(() => {
    debug("HTTP server closed");
    ldClient.close();
  });
});
