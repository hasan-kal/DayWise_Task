
const express = require("express");

const app = express();
app.use(express.json());

const listings = [];
const orders = [];

let listingId = 1;
let orderId = 1;

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED"
];

function error(res, status, message) {
  return res.status(status).json({
    error: {
      message
    }
  });
}

// 1. Seller creates a listing
app.post("/api/listings", (req, res) => {
  const { sellerId, title, price, category, location } = req.body;

  if (!sellerId || !title || !category || !location) {
    return error(res, 400, "Missing required listing fields");
  }

  if (typeof price !== "number" || price <= 0) {
    return error(res, 400, "Price must be a positive number");
  }

  const listing = {
    id: listingId++,
    sellerId,
    title,
    price,
    category,
    location,
    status: "ACTIVE"
  };

  listings.push(listing);

  return res.status(201).json(listing);
});

// 2. Buyer searches active listings
app.get("/api/listings", (req, res) => {
  const query = (req.query.query || "").toLowerCase();
  const category = (req.query.category || "").toLowerCase();

  const results = listings.filter((listing) => {
    return (
      listing.status === "ACTIVE" &&
      listing.title.toLowerCase().includes(query) &&
      listing.category.toLowerCase().includes(category)
    );
  });

  return res.status(200).json({
    count: results.length,
    listings: results
  });
});

// 3. Buyer places an order
app.post("/api/orders", (req, res) => {
  const { buyerId, listingId: requestedListingId } = req.body;

  if (!buyerId || !Number.isInteger(requestedListingId)) {
    return error(res, 400, "buyerId and listingId are required");
  }

  const listing = listings.find(
    (item) => item.id === requestedListingId
  );

  if (!listing || listing.status !== "ACTIVE") {
    return error(res, 404, "Listing not found or unavailable");
  }

  const order = {
    id: orderId++,
    buyerId,
    sellerId: listing.sellerId,
    listingId: listing.id,
    price: listing.price,
    status: "PENDING"
  };

  orders.push(order);

  return res.status(201).json(order);
});

// 4. Seller/admin updates order status
app.patch("/api/orders/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const order = orders.find((item) => item.id === id);

  if (!order) {
    return error(res, 404, "Order not found");
  }

  const currentIndex = allowedStatuses.indexOf(order.status);
  const nextIndex = allowedStatuses.indexOf(status);

  if (nextIndex === -1 || nextIndex !== currentIndex + 1) {
    return error(res, 400, "Invalid order status transition");
  }

  order.status = status;

  return res.status(200).json(order);
});

app.use((req, res) => {
  return error(res, 404, "Endpoint not found");
});

app.use((err, req, res, next) => {
  return error(res, 400, "Invalid JSON or request");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Marketplace API running on port ${PORT}`);
});
