
const express = require("express");
const crypto = require("crypto");

const app = express();

// Custom middleware: request ID and logging
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startTime = Date.now();

  res.setHeader("X-Request-ID", req.requestId);

  res.on("finish", () => {
    const latencyMs = Date.now() - req.startTime;

    console.log(
      `[${req.requestId}] ${req.method} ${req.originalUrl} ` +
      `${res.statusCode} ${latencyMs}ms`
    );
  });

  next();
});

app.use(express.json());

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}


function validateMetrics(req, res, next) {
  const {
    service,
    latencyMs,
    requestCount,
    errorCount,
    latencyThresholdMs,
    errorRateThreshold
  } = req.body;

  if (
    typeof service !== "string" ||
    service.trim().length === 0
  ) {
    return next(
      new AppError("Service name is required", 400)
    );
  }

  if (
    typeof latencyMs !== "number" ||
    !Number.isFinite(latencyMs) ||
    latencyMs < 0
  ) {
    return next(
      new AppError("Latency must be a non-negative number", 400)
    );
  }

  if (
    !Number.isInteger(requestCount) ||
    requestCount <= 0
  ) {
    return next(
      new AppError("Request count must be a positive integer", 400)
    );
  }

  if (
    !Number.isInteger(errorCount) ||
    errorCount < 0 ||
    errorCount > requestCount
  ) {
    return next(
      new AppError(
        "Error count must be between 0 and request count",
        400
      )
    );
  }

  if (
    typeof latencyThresholdMs !== "number" ||
    !Number.isFinite(latencyThresholdMs) ||
    latencyThresholdMs < 0
  ) {
    return next(
      new AppError("Invalid latency threshold", 400)
    );
  }

  if (
    typeof errorRateThreshold !== "number" ||
    !Number.isFinite(errorRateThreshold) ||
    errorRateThreshold < 0 ||
    errorRateThreshold > 100
  ) {
    return next(
      new AppError(
        "Error rate threshold must be between 0 and 100",
        400
      )
    );
  }

  next();
}


app.post("/api/metrics", validateMetrics, (req, res) => {
  const {
    service,
    latencyMs,
    requestCount,
    errorCount,
    latencyThresholdMs,
    errorRateThreshold
  } = req.body;

  const errorRate = (errorCount / requestCount) * 100;

  const alerts = [];

  if (latencyMs > latencyThresholdMs) {
    alerts.push("LATENCY_THRESHOLD_EXCEEDED");
  }

  if (errorRate > errorRateThreshold) {
    alerts.push("ERROR_RATE_THRESHOLD_EXCEEDED");
  }

  return res.status(200).json({
    requestId: req.requestId,
    service,
    metrics: {
      latencyMs,
      errorRate: Number(errorRate.toFixed(2))
    },
    thresholds: {
      latencyThresholdMs,
      errorRateThreshold
    },
    status: alerts.length > 0 ? "ALERT" : "OK",
    alerts
  });
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Monitoring API running on port ${PORT}`);
});
