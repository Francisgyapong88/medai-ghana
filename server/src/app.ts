import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import visitRoutes from "./routes/visit.routes";
import assessmentRoutes from "./routes/assessment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import allergyRoutes from "./routes/allergy.routes";
import medicalHistoryRoutes from "./routes/medicalHistory.routes";
import historyRoutes from "./routes/history.routes";
import analyticsRoutes from "./routes/analytics.routes";
import userRoutes from "./routes/user.routes";
import facilityRoutes from "./routes/facility.routes";
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/allergies", allergyRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/facilities", facilityRoutes);
// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MedAI Ghana API",
    version: "1.0.0",
    status: "Running",
  });
});
export default app;