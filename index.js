const express = require("express");
const path = require("path");
require("dotenv").config();
const serveStatic = require("serve-static");
const launchDarkly = require("@launchdarkly/node-server-sdk");
const bodyParser = require("body-parser");

const EmailService = require("./email-service");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const app = express();

app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

const emailService = new EmailService(mg, resend);

app.post("/reset-password", async (req, res) => {
  const userEmailAddress = req.body.email;
  console.log("email", userEmailAddress);
  const context = {
    kind: "user",
    key: userEmailAddress,
    anonymous: true,
  };

  const emailProvider = await ldClient.variation(
    "email-provider",
    context,
    "mailgun"
  );
  console.log("emailProvider", emailProvider);

  let emailServiceResponseData;
  try {
    emailServiceResponseData = await emailService.sendPasswordReset(
      userEmailAddress,
      emailProvider
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({
      message: "Failed to send password reset email. Please try again later.",
    });
  }

  console.log(emailServiceResponseData);
  res.status(200).json({
    message: "Check your email inbox for password reset instructions.",
  });
});

// Initialize the LaunchDarkly client
const ldClient = launchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

// Add the waitForInitialization function to ensure the client is ready before starting the server
const timeoutInSeconds = 5;
let server;
ldClient.waitForInitialization({ timeout: timeoutInSeconds }).then(() => {
  const port = 3000;
  server = app.listen(port, function (err) {
    if (err) console.log("Error in server setup");
    console.log(`Server listening on http://localhost:${port}`);
  });
});

// Add the following new function to gracefully close the connection to the LaunchDarkly server.
process.on("SIGINT", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    ldClient.close(() => {
      console.log("LaunchDarkly client closed");
    });
  });
});
