# Local Marketplace REST API

## Overview
A REST API for a local marketplace where sellers create product listings, buyers search products and place orders, and sellers/admins update order status.

## Setup
```bash
npm install
npm start
```

The server runs at `http://localhost:3000`.

## Endpoints

### 1. Create listing
`POST /api/listings`

Request:
```json
{
  "sellerId": "seller101",
  "title": "Used iPhone 12",
  "price": 18000,
  "category": "electronics",
  "location": "Jaipur"
}
```

Response: `201 Created`

### 2. Search listings
`GET /api/listings?query=iphone&category=electronics`

Returns active listings matching the search.

Response: `200 OK`

### 3. Create order
`POST /api/orders`

Request:
```json
{
  "buyerId": "buyer201",
  "listingId": 1
}
```

Response: `201 Created`

### 4. Update order status
`PATCH /api/orders/:id/status`

Request:
```json
{
  "status": "CONFIRMED"
}
```

Response: `200 OK`

## Validation
- Listing title, seller, category and location are required.
- Price must be a positive number.
- Order requires a buyer ID and valid listing ID.
- Orders can only move sequentially: PENDING → CONFIRMED → SHIPPED → DELIVERED.
- Missing resources return `404 Not Found`.
- Invalid input returns `400 Bad Request`.

## Error format
```json
{
  "error": {
    "message": "Invalid order status transition"
  }
}
```

## Design decisions
- Listings are searchable by title and category.
- Only active listings appear in search.
- Order price is copied from the listing at purchase time.
- In-memory storage is used for this assignment; data resets when the server restarts.
- Authentication and database persistence are outside the scope of this prototype.

## Testing
The API was tested using curl with listing creation, search, order creation, status update, and invalid input requests.