# Restaurant Reservation API

A production-ready REST API for managing restaurant table reservations.
Built to demonstrate clean backend architecture, strong business-logic enforcement, and scalability considerations.

---

## Tech Stack
- Node.js
- Express
- TypeScript
- MySQL
- Sequelize ORM
- Redis (optional caching)
- Jest + Supertest
- Docker & Docker Compose
- Swagger (API documentation)

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- Docker (optional but recommended)

### Environment Variables

Create a `.env` file:

#### Required
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=restaurant_db
```

#### Optional
```
REDIS_URL=redis://localhost:6379
PEAK_START=18:00
PEAK_END=21:00
PEAK_MAX_DURATION=90
```

### Run Locally
```
npm install
npm run dev
```

### Run with Docker
```
docker-compose up --build
```

### Run Tests
```
npm test
```

### API Docs
Swagger UI:
http://localhost:3000/docs

---

## API Documentation

### Restaurants
- POST /restaurants
- POST /restaurants/:id/tables
- GET /restaurants/:id
- GET /restaurants/:id/availability

### Reservations
- POST /reservations/:restaurantId
- PATCH /reservations/:id
- PATCH /reservations/:id/cancel
- GET /restaurants/:id/reservations

### Waitlist
- POST /restaurants/:id/waitlist
- GET /restaurants/:id/waitlist

---

## Design Decisions & Assumptions

### Design Decisions
- TypeScript (strict mode) for safety and clarity
- Sequelize for relational integrity
- Business logic isolated in services
- Redis caching for availability queries
- Seating optimization selects smallest fitting table
- Waitlist handled separately from reservations

### Assumptions
- Single timezone per restaurant
- Operating hours stored as HH:mm
- Availability step is 30 minutes
- One reservation per table

---

## Known Limitations
- No authentication or authorization
- No timezone normalization
- No async workers
- Static peak-hour rules

---

## What I Would Improve with More Time
- Automatic waitlist promotion
- Background jobs for notifications
- Dynamic peak-hour configuration
- Monitoring and tracing
- Multi-table reservations

---

## Scaling Strategy
- Redis caching (already implemented)
- Read replicas
- Horizontal scaling
- Partitioning by restaurant
- Event-driven updates


