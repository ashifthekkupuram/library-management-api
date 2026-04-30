import express from "express";
import authRoute from "./routes/authRoute.ts";
import errorHandler from "./middlewares/errorHandler.ts";

const app = express();

// App Configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "LIBRARY MANAGEMENT API",
  });
});

// API Endpoints
app.use("/api/auth", authRoute);

// Error Handler
app.use(errorHandler);

export { app };

export default app;
