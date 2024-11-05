const express = require("express");
const path = require("path");
require("dotenv").config();
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");

const app = express();

app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// const emailService = new EmailService(mg, resend);

app.post("/reset-password", async (req, res) => {
  // TODO: implement logic to send password reset email
  res.status(200).json({
    message: "Check your email inbox for password reset instructions.",
  });
});

const server = app.listen(3000, function (err) {
  if (err) console.log("Error in server setup");
  console.log(`Server listening on http://localhost:3000`);
});
