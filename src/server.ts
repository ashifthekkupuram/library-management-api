import express from "express";

import errorHandler from "./middlewares/errorHandler.ts";

import authRoute from "./routes/authRoute.ts";
import bookMetadataRoute from "./routes/bookMetadataRoute.ts";
import customerRoute from "./routes/customerRoute.ts";
import bookItemRoute from "./routes/bookItemRoute.ts";
import borrowTransactionRoute from "./routes/borrowTransactionRoute.ts";

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
app.use("/api/bookmetadata", bookMetadataRoute);
app.use("/api/customers", customerRoute);
app.use("/api/bookitem", bookItemRoute);
app.use("/api/transaction", borrowTransactionRoute);

// Error Handler
app.use(errorHandler);

export { app };

export default app;
