# Restaurant Reservation API

Setup
- Clone repository and install dependencies
- Create .env with PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME
- Optional: REDIS_URL, PEAK_START, PEAK_END, PEAK_MAX_DURATION
- Dev: npm run dev
- Build: npm run build
- Test: npm test

API
- POST /restaurants
- POST /restaurants/:id/tables
- GET /restaurants/:id
- GET /restaurants/:id/reservations?date=YYYY-MM-DD
- GET /restaurants/:id/availability?date=YYYY-MM-DD&partySize=N&durationMinutes=M
- POST /restaurants/:id/waitlist
- GET /restaurants/:id/waitlist
- POST /reservations/:restaurantId
- PATCH /reservations/:id/cancel
- PATCH /reservations/:id

Design
- Sequelize models with associations and FK fields
- Operating-hours and capacity enforcement
- Overlap prevention using time-window queries
- Availability caching via Redis when REDIS_URL is set
- Peak-hour duration limit via env
- Waitlist endpoints

Assumptions
- Time stored as strings HH:mm:ss for operating hours
- Availability step is 30 minutes

Limitations
- No Redis caching, no Docker in this version
- No waitlist
- Updated: Redis and Docker included

Scaling
- Shard by restaurant, cache availability, add read replicas
