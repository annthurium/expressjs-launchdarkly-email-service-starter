const express = require("express");
const path = require("path");
require("dotenv").config();
const serveStatic = require("serve-static");
const launchDarkly = require("@launchdarkly/node-server-sdk");
const bodyParser = require("body-parser");

const app = express();

app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/reset-password", async (req, res) => {
  const email = req.body.email;
  console.log("email", email);
  // TODO: Implement password reset logic
  res.status(200).json({ message: "Password reset endpoint reached" });
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
