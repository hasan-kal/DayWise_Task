# Day 6 – Authentication & Authorization

**Project:** Movie Discovery App

Implemented a JWT-based authentication and authorization system using Node.js, Express, bcryptjs and jsonwebtoken.

### Implementation
1. Users register with their name, email and password.
2. Passwords are hashed using bcrypt with 12 salt rounds before storage.
3. During login, bcrypt compares the submitted password with the stored hash.
4. Upon successful login, the server generates a JWT containing the user ID and role.
5. Tokens expire after one hour.
6. Authentication middleware verifies JWT signatures and expiry before allowing access to protected routes.
7. Role-based authorization restricts movie management operations to administrators.
8. Ownership verification ensures users can only access their own watchlists.
9. Personalized recommendation routes use the authenticated user ID.

### Edge Case Demonstrated
A user attempts to access another user's watchlist using a valid JWT. The ownership check rejects the request with HTTP 403 Forbidden.

Requests without a token receive HTTP 401 Unauthorized.

### Threat Note
Potential threats include stolen JWTs, brute-force login attempts, unauthorized role escalation and insecure secret storage.

Mitigations include bcrypt password hashing, short-lived JWTs, server-side role assignment, ownership verification, environment-based secrets and HTTPS in production.

**Storage limitation:** This implementation uses in-memory storage for demonstration. A production version should use a persistent database and appropriate token revocation and rate-limiting mechanisms.