const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

const userRoute = require("../Routes/userRoutes");
const classesRoute = require("../Routes/classesRoutes");
const developersRoute = require("../Routes/developersRoutes");
const discussionsRoute = require("../Routes/discussionsRoutes");

// MongoDB Connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@virtualclassrommcluster.aq29t.mongodb.net/ClassNet?retryWrites=true&w=majority&appName=VirtualClassrommCluster`
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://class-net.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) =>{
  next();
}
// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

// JWT Token Creation Route
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '365d',
  });
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .send({ success: true });
});

// Logout Route
app.get('/logout', async (req, res) => {
  try {
    res
      .clearCookie('token', {
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({ success: true });
    console.log('Logout successful');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Routes
app.use("/users", userRoute);
app.use("/classes", classesRoute);
app.use("/developers", developersRoute);
app.use("/discussions", discussionsRoute);

// Default Route
app.get("/", (req, res) => {
  res.send("Hello From Class Net server!");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
