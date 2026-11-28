
require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Demo in-memory database
const users = [];
const watchlists = [];
const movies = [];

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Register user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and password (minimum 8 characters) required"
      });
    }

    const existingUser = users.find(
      user => user.email === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user"
    };

    users.push(user);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email?.toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token,
    expiresIn: "1h"
  });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.sub,
      role: decoded.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

// Role-based authorization middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
}

// Protected: Get logged-in user's watchlists
app.get("/api/watchlists", authenticateToken, (req, res) => {
  const userWatchlists = watchlists.filter(
    list => list.ownerId === req.user.id
  );

  res.json(userWatchlists);
});

// Protected: Create a watchlist
app.post("/api/watchlists", authenticateToken, (req, res) => {
  const { name, movieIds = [] } = req.body;

  if (!name || !Array.isArray(movieIds)) {
    return res.status(400).json({
      message: "Valid watchlist name and movie IDs required"
    });
  }

  const watchlist = {
    id: crypto.randomUUID(),
    name,
    movieIds,
    ownerId: req.user.id
  };

  watchlists.push(watchlist);

  res.status(201).json(watchlist);
});

// Protected: Access a particular watchlist
app.get(
  "/api/watchlists/:id",
  authenticateToken,
  (req, res) => {
    const watchlist = watchlists.find(
      list => list.id === req.params.id
    );

    if (!watchlist) {
      return res.status(404).json({
        message: "Watchlist not found"
      });
    }

    // Ownership verification
    if (watchlist.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot access another user's watchlist"
      });
    }

    res.json(watchlist);
  }
);

// Admin-only: Add movies to the discovery catalogue
app.post(
  "/api/admin/movies",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const { title, genre } = req.body;

    if (!title || !genre) {
      return res.status(400).json({
        message: "Movie title and genre required"
      });
    }

    const movie = {
      id: crypto.randomUUID(),
      title,
      genre
    };

    movies.push(movie);

    res.status(201).json({
      message: "Movie added successfully",
      movie
    });
  }
);

// Public: Discover movies
app.get("/api/movies", (req, res) => {
  const { genre } = req.query;

  const filteredMovies = genre
    ? movies.filter(
        movie => movie.genre.toLowerCase() === genre.toLowerCase()
      )
    : movies;

  res.json(filteredMovies);
});

// Start server
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

app.listen(PORT, () => {
  console.log(`Movie Discovery API running on port ${PORT}`);
});
