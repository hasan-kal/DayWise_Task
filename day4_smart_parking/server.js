
const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

// In-memory parking slot data
const parkingSlots = [
  { id: "P1", status: "AVAILABLE", reservedBy: null },
  { id: "P2", status: "AVAILABLE", reservedBy: null },
  { id: "P3", status: "AVAILABLE", reservedBy: null }
];

// Custom middleware: Request ID and logging
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();

  res.setHeader("X-Request-ID", req.requestId);

  console.log(
    `[${req.requestId}] ${req.method} ${req.originalUrl}`
  );

  next();
});

// GET: Check parking slot availability
app.get("/api/parking/:slotId", (req, res) => {
  const { slotId } = req.params;

  const slot = parkingSlots.find(
    (item) => item.id === slotId
  );

  if (!slot) {
    return res.status(404).json({
      error: "Parking slot not found"
    });
  }

  return res.status(200).json({
    requestId: req.requestId,
    slotId: slot.id,
    status: slot.status,
    available: slot.status === "AVAILABLE"
  });
});

// POST: Reserve a parking slot
app.post("/api/parking/:slotId/reserve", (req, res) => {
  const { slotId } = req.params;
  const { userId } = req.body;

  // Validate userId
  if (
    typeof userId !== "string" ||
    userId.trim().length === 0
  ) {
    return res.status(400).json({
      error: "userId is required"
    });
  }

  const slot = parkingSlots.find(
    (item) => item.id === slotId
  );

  if (!slot) {
    return res.status(404).json({
      error: "Parking slot not found"
    });
  }

  // Check reservation conflict
  if (slot.status === "RESERVED") {
    return res.status(409).json({
      error: "Parking slot is already reserved"
    });
  }

  // Reserve the slot
  slot.status = "RESERVED";
  slot.reservedBy = userId.trim();

  return res.status(201).json({
    message: "Parking slot reserved successfully",
    reservation: {
      slotId: slot.id,
      userId: slot.reservedBy,
      status: slot.status
    }
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Smart Parking API running on port ${PORT}`);
});
