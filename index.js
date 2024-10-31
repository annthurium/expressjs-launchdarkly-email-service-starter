const express = require("express");
const path = require("path");

const app = express();
const serveStatic = require("serve-static");
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(serveStatic(path.join(__dirname, "public")));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
