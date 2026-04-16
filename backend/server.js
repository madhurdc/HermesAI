import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {requireAuth} from "./src/middleware/authMiddleware";
import resumeRoutes from "./src/routes/resumeRoutes";
import careerRoutes from "./src/routes/careerRoutes";
import interviewRoutes from "./src/routes/interviewRoutes";

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json()); // To read json data from frontend

// Connecting the routes
app.use("api/resume",resumeRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/interview",interviewRoutes);

app.listen(process.env.PORT, () => console.log(`Server Running on port ${process.env.PORT}`)); 