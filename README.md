# ✈️ Planora — Intelligent Travel Planning Platform

> A full-stack travel itinerary generator powered by a custom recommendation engine — not just an AI prompt.

## 📌 What is Planora?

Planora is a full-stack web application that generates personalized day-by-day travel itineraries based on:

- Destination
- Budget
- Number of days and travelers
- Travel type (Solo / Friends / Family / Couple)
- Interests (Beach, History, Food, Nature, Adventure, etc.)
- Hotel preference and travel pace

The key difference from other travel apps: **the recommendation logic is entirely custom-built**. Gemini AI is used only to beautify the final text — not to generate any decisions.

---

## 🧠 The 7-Engine Recommendation System

This is the core of Planora. Every engine is custom JavaScript logic:

| Engine | What it does |
|---|---|
| 1. Fetch Places | Fetches real places from OpenStreetMap via Overpass API |
| 2. Classifier | Maps raw place categories to metadata (travel type, cost level, best time) |
| 3. Scoring Engine | Scores each place 0-100 based on user preferences with hard filters |
| 4. Scheduler | Distributes places across days into Morning/Afternoon/Evening/Night slots |
| 5. Budget Engine | Calculates full cost breakdown (hotel, food, transport, activities) |
| 6. Route Optimizer | Reorders places per day using greedy nearest-neighbor algorithm (Haversine) |
| 7. Gemini Beautifier | Rewrites place descriptions in engaging English — doesn't make decisions |

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts, Leaflet.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Places Data | OpenStreetMap (Nominatim + Overpass API) |
| Maps | Leaflet.js + OpenStreetMap |
| AI | Gemini API (text beautification only) |
| PDF Export | PDFKit |

---

## ✨ Features

- 🔐 JWT Authentication (Signup, Login, Forgot Password)
- 🗺️ Real place data from OpenStreetMap APIs
- 🧠 Custom 7-engine recommendation pipeline
- 📅 Day-by-day itinerary with time slots
- 💰 Budget breakdown with pie chart
- 🗺️ Interactive map with place markers (Leaflet.js)
- ✏️ Full itinerary editing (swap, remove, add custom places, reorder, notes)
- 📄 PDF export
- 🔗 Shareable public trip link
- ❤️ Save favourite trips
- 📊 Dashboard with trip stats

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Gemini API key (free at aistudio.google.com)

### Backend Setup
```bash
cd planora-backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

```bash
node server.js
```

### Frontend Setup
```bash
cd planora-frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure
