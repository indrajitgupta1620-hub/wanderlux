# ✈️ Wanderlux — Full-Stack Travel Booking Platform

> Curated travel experiences with AI-powered itineraries, smart destination insights, and real-time crowd intelligence.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## 🛠 Tech Stack

| Layer        | Technology                                      |
|------------- | ----------------------------------------------- |
| **Frontend** | HTML5, CSS3 (custom properties), Vanilla JS     |
| **Backend**  | Node.js 18+, Express.js                         |
| **Database** | MongoDB (Mongoose ORM)                          |
| **Auth**     | JWT (jsonwebtoken + bcryptjs)                   |
| **AI**       | Anthropic Claude API (itinerary generation)     |
| **Security** | Helmet, express-rate-limit, CORS                |
| **Deploy**   | Frontend → Vercel/Netlify · Backend → Render    |

---

## ✨ Features

### Core User Features
- 🔐 JWT-based registration & login
- 🌍 Browse & search destinations (filter by category, keyword)
- 📖 Smart destination pages — attractions, itinerary, restaurants, hotels
- 📅 Book travel packages with real-time pricing
- ❤️ Save favourite destinations
- 🧾 View full booking history with status tracking

### Smart Destination Feature
Each destination page auto-displays:
- Top tourist attractions with descriptions
- Recommended restaurants & hotels
- Suggested 3-day itinerary
- Best travel season
- Local activities
- Estimated trip cost

### AI Trip Planner
Users enter:
- Destination
- Number of days
- Budget
- Travel style (luxury / budget / adventure / cultural / relaxation / family)

→ Claude generates a custom day-by-day itinerary with morning / afternoon / evening activities, local tips, and packing advice.

### Crowd Level Indicator
Every destination shows a visual crowd bar:
- 🟢 Low (≤40%) — best for peaceful travel
- 🟡 Moderate (41–70%) — typical crowd level
- 🔴 Busy (71–100%) — book in advance, expect queues

### Smart Recommendation Engine
- After booking or browsing, similar destinations are surfaced
- Personalised recommendations via `/api/recommendations` (authenticated)
- Category-based similarity mapping

---

## 📁 Project Structure

```
travel-booking-app/
├── frontend/
│   └── index.html              # Complete SPA (HTML + CSS + JS)
│
└── backend/
    ├── server.js               # Express app entry point
    ├── package.json
    ├── .env.example
    │
    ├── models/
    │   ├── User.js             # User schema (bcrypt password hashing)
    │   ├── Destination.js      # Destination schema (full smart data)
    │   └── Booking.js          # Booking schema (auto tax calculation)
    │
    ├── routes/
    │   ├── auth.js             # Register, login, profile, favourites
    │   ├── destinations.js     # CRUD destinations + search
    │   ├── bookings.js         # Book trip, list, cancel
    │   └── recommendations.js  # Smart recommendations engine
    │
    ├── middleware/
    │   └── auth.js             # JWT protect + role-based restrictTo
    │
    └── data/
        └── seed.js             # 8 fully detailed destination seeds
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone & install backend

```bash
cd travel-booking-app/backend
npm install
cp .env.example .env
# → Edit .env with your MONGODB_URI and JWT_SECRET
```

### 2. Run the backend

```bash
npm run dev       # Development (nodemon, auto-restart)
# or
npm start         # Production
```

On first run, the DB is automatically seeded with 8 destinations.

### 3. Open the frontend

Simply open `frontend/index.html` in your browser — no build step needed.

For the AI Planner to work, ensure you have a valid `ANTHROPIC_API_KEY` in your environment and the frontend is calling your backend's proxy (or directly configure it in the JS).

---

## 📡 API Reference

### Authentication

| Method | Endpoint              | Auth   | Description                  |
|--------|-----------------------|--------|------------------------------|
| POST   | `/api/register`       | –      | Create account                |
| POST   | `/api/login`          | –      | Sign in, returns JWT         |
| GET    | `/api/me`             | Bearer | Get current user profile     |
| PATCH  | `/api/me`             | Bearer | Update name / phone / avatar |
| POST   | `/api/me/favorites/:id` | Bearer | Toggle favourite destination |

**Register Request**
```json
POST /api/register
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "SecurePass123"
}
```

**Login Response**
```json
{
  "status": "success",
  "token": "eyJhbGci...",
  "data": { "user": { "_id": "...", "name": "Priya", "email": "..." } }
}
```

---

### Destinations

| Method | Endpoint                       | Auth  | Description                    |
|--------|--------------------------------|-------|--------------------------------|
| GET    | `/api/destinations`            | –     | List destinations (paginated)  |
| GET    | `/api/destination/:id`         | –     | Full destination detail        |
| POST   | `/api/destinations`            | Admin | Create destination             |
| PATCH  | `/api/destinations/:id`        | Admin | Update destination             |
| DELETE | `/api/destinations/:id`        | Admin | Soft-delete destination        |

**Query Parameters for GET /api/destinations:**
```
?category=beach        Filter by category
?search=Paris          Full-text search
?featured=true         Featured only
?page=1&limit=12       Pagination
?sort=-rating          Sort field
```

---

### Bookings

| Method | Endpoint                     | Auth   | Description              |
|--------|------------------------------|--------|--------------------------|
| POST   | `/api/book-trip`             | Bearer | Create a new booking     |
| GET    | `/api/user-bookings`         | Bearer | List my bookings         |
| GET    | `/api/bookings/:id`          | Bearer | Single booking detail    |
| PATCH  | `/api/bookings/:id/cancel`   | Bearer | Cancel a booking         |

**Book Trip Request**
```json
POST /api/book-trip
Authorization: Bearer <token>

{
  "destinationId": "60d5ec49f...",
  "travelDate": "2025-11-15",
  "returnDate": "2025-11-20",
  "numberOfPeople": 2,
  "notes": "Honeymoon trip"
}
```

---

### Recommendations

| Method | Endpoint                          | Auth   | Description                  |
|--------|-----------------------------------|--------|------------------------------|
| GET    | `/api/recommendations/:destId`    | –      | Similar to given destination |
| GET    | `/api/recommendations`            | Bearer | Personalised for user        |

---

## 🗄 Database Schema

### Users Collection
```json
{
  "name":      "string",
  "email":     "string (unique, lowercase)",
  "password":  "string (bcrypt hashed, hidden by default)",
  "phone":     "string",
  "favorites": ["ObjectId → Destination"],
  "role":      "user | admin",
  "isActive":  "boolean",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Destinations Collection
```json
{
  "name":         "string",
  "country":      "string",
  "category":     "beach | mountain | city | cultural | adventure | luxury",
  "description":  "string",
  "coverImage":   "string (URL)",
  "touristSpots": [{ "name", "icon", "description" }],
  "restaurants":  ["string"],
  "hotels":       ["string"],
  "activities":   ["string"],
  "bestSeason":   "string",
  "itinerary":    [{ "day", "title", "activities" }],
  "estimatedCost":"number (INR/person)",
  "rating":       "number (0–5)",
  "crowdLevel":   "number (0–100)",
  "isFeatured":   "boolean",
  "tags":         ["string"]
}
```

### Bookings Collection
```json
{
  "bookingRef":     "string (auto BK + timestamp)",
  "userId":         "ObjectId → User",
  "destinationId":  "ObjectId → Destination",
  "travelDate":     "Date",
  "numberOfPeople": "number",
  "pricePerPerson": "number",
  "taxAmount":      "number (18%, auto-computed)",
  "totalAmount":    "number (auto-computed)",
  "bookingStatus":  "pending | confirmed | cancelled | completed",
  "paymentStatus":  "unpaid | paid | refunded",
  "cancelledAt":    "Date",
  "cancelReason":   "string"
}
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd travel-booking-app/frontend
vercel --prod
```

Or drag-and-drop `frontend/` into [vercel.com](https://vercel.com).

### Backend → Render

1. Push your `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (see below)

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add database user and whitelist `0.0.0.0/0` (or Render's IP)
3. Copy connection string → set as `MONGODB_URI`

---

## 🔑 Environment Variables

| Variable         | Required | Description                              |
|------------------|----------|------------------------------------------|
| `MONGODB_URI`    | ✅       | MongoDB Atlas connection string          |
| `JWT_SECRET`     | ✅       | Random 64-char secret (use `openssl rand -hex 64`) |
| `JWT_EXPIRES_IN` | –        | Token expiry (default: `7d`)             |
| `PORT`           | –        | Server port (default: `5000`)            |
| `FRONTEND_URL`   | –        | CORS origin (default: `*`)               |
| `ANTHROPIC_API_KEY` | –     | For AI itinerary generation              |

---

## 🧪 API Testing Examples

Using **curl**:

```bash
# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get destinations
curl http://localhost:5000/api/destinations?category=beach

# Get single destination
curl http://localhost:5000/api/destination/<DESTINATION_ID>

# Book a trip (replace TOKEN and DEST_ID)
curl -X POST http://localhost:5000/api/book-trip \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"destinationId":"<DEST_ID>","travelDate":"2025-12-10","numberOfPeople":2}'

# Get my bookings
curl http://localhost:5000/api/user-bookings \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📝 Bonus Features (Ready to Implement)

- **Stripe/Razorpay Payment**: Add `paymentRef` to Booking + webhook handler
- **Google Maps**: Embed Maps API on Destination detail page with `touristSpots` markers
- **Weather API**: OpenWeatherMap call on destination load
- **Reviews**: Add `Review` model linking `userId + destinationId + rating + comment`
- **Email Notifications**: Use Nodemailer/SendGrid to email booking confirmations

---

## 📄 License

MIT — built with ✦ for curious travellers.
# wanderlux
