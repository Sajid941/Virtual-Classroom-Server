const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

const userRoute = require('./Routes/userRoutes'); // Correct import for router

// MongoDB Connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@virtualclassrommcluster.aq29t.mongodb.net/ClassNet?retryWrites=true&w=majority&appName=VirtualClassrommCluster`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON

// Routes
app.use('/users', userRoute); // Ensure it's using the correct router

// Default Route
app.get("/", (req, res) => {
  res.send("Hello From Class Net server!");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
