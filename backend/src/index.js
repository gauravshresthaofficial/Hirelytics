const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const app = express();
const logger = require("./middlewares/logger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const positionRoutes = require("./routes/positionRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const reportRoutes = require("./routes/reportRoutes");

dbConnect();
//middleware
app.use(express.json());
app.use(logger);
app.use(cors());

const corsOptions = {
  origin: [
    "https://resumetric.vercel.app",
    "https://hirelytics.vercel.app",
    "http://localhost:5173",
    "https://resumetric.shresthagaurav.com/",
    "https://hirelytics.shresthagaurav.com/",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

//routes
app.get("/", (req, res) => {
  res.send("Are you ready to use this services?");
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/reports", reportRoutes);
//start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
