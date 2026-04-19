# Football Statistics API

A comprehensive RESTful API for football (soccer) match statistics, team management, player tracking, and performance analytics. Built with Node.js, Express, Sequelize ORM, and SQLite.

## Features

- **Team Management** â€?Full CRUD operations for football teams with filtering and pagination
- **Player Management** â€?Full CRUD operations for players with position, nationality, and performance stats
- **Match Management** â€?Full CRUD operations for matches with season, competition, and status tracking
- **Analytics & Insights** â€?League standings, top scorers, team performance summaries, head-to-head comparisons, and season trend analysis
- **JWT Authentication** - Secure endpoints with JSON Web Token-based authentication
- **Role-Based Authorization** - Destructive delete operations require admin privileges
- **Swagger Documentation** â€?Interactive API documentation via Swagger UI
- **Input Validation** â€?Request validation using express-validator
- **Pagination & Filtering** â€?All list endpoints support pagination and query-based filtering
- **Comprehensive Testing** - Expanded integration tests covering auth, RBAC, validation, CRUD, and analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | SQLite |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Documentation | Swagger (swagger-jsdoc + swagger-ui-express) |
| Validation | express-validator |
| Testing | Jest + Supertest |

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd football-statistics-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

Create a `.env` file in the project root (a default one is provided):

```env
PORT=3000
JWT_SECRET=football_stats_api_secret_key_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 4. Seed the database

Populate the database with 20 Premier League teams, 30 players, and 380 match records:

```bash
npm run seed
```

This creates two default user accounts:
- **Admin**: `admin@footballstats.com` / `admin123`
- **Demo user**: `demo@footballstats.com` / `demo123`

### 5. Start the server

```bash
npm start
```

The server will start at `http://localhost:3000`. For development with auto-reload:

```bash
npm run dev
```

### 6. Access API documentation

Open `http://localhost:3000/api-docs` in your browser for the interactive Swagger UI documentation.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user (always `role=user`) | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |

### Teams

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/teams` | List all teams (with pagination/filtering) | No |
| GET | `/api/teams/:id` | Get team details (includes players) | No |
| POST | `/api/teams` | Create a new team | Yes |
| PUT | `/api/teams/:id` | Update a team | Yes |
| DELETE | `/api/teams/:id` | Delete a team | Admin |

### Players

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/players` | List all players (with pagination/filtering) | No |
| GET | `/api/players/:id` | Get player details | No |
| POST | `/api/players` | Create a new player | Yes |
| PUT | `/api/players/:id` | Update a player | Yes |
| DELETE | `/api/players/:id` | Delete a player | Admin |

### Matches

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/matches` | List all matches (with pagination/filtering) | No |
| GET | `/api/matches/:id` | Get match details | No |
| POST | `/api/matches` | Create a new match | Yes |
| PUT | `/api/matches/:id` | Update a match | Yes |
| DELETE | `/api/matches/:id` | Delete a match | Admin |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/leaderboard` | League standings by season & competition | No |
| GET | `/api/analytics/top-scorers` | Top goal scorers across all teams | No |
| GET | `/api/analytics/teams/:id/performance` | Team performance summary | No |
| GET | `/api/analytics/head-to-head` | Head-to-head comparison between two teams | No |
| GET | `/api/analytics/seasons/:season` | Season summary with monthly goal trends | No |

## Example Requests

### Register a user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "pass123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@footballstats.com", "password": "admin123"}'
```

### Get league standings

```bash
curl "http://localhost:3000/api/analytics/leaderboard?season=2023-2024&competition=Premier%20League"
```

### Get top scorers

```bash
curl "http://localhost:3000/api/analytics/top-scorers?limit=5"
```

### Create a team (authenticated)

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"name": "Leeds United", "country": "England", "league": "Championship", "founded": 1919, "stadium": "Elland Road"}'
```

## Running Tests

```bash
npm test
```

For test coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
â”œâ”€â”€ src/
â”?  â”œâ”€â”€ config/
â”?  â”?  â”œâ”€â”€ database.js          # Sequelize + SQLite configuration
â”?  â”?  â””â”€â”€ swagger.js           # Swagger/OpenAPI configuration
â”?  â”œâ”€â”€ controllers/
â”?  â”?  â”œâ”€â”€ authController.js    # Authentication logic
â”?  â”?  â”œâ”€â”€ teamController.js    # Team CRUD logic
â”?  â”?  â”œâ”€â”€ playerController.js  # Player CRUD logic
â”?  â”?  â”œâ”€â”€ matchController.js   # Match CRUD logic
â”?  â”?  â””â”€â”€ analyticsController.js # Analytics & statistics logic
â”?  â”œâ”€â”€ middleware/
â”?  â”?  â”œâ”€â”€ auth.js              # JWT authentication middleware
â”?  â”?  â”œâ”€â”€ errorHandler.js      # Global error handling
â”?  â”?  â””â”€â”€ validate.js          # Request validation middleware
â”?  â”œâ”€â”€ models/
â”?  â”?  â”œâ”€â”€ index.js             # Model associations
â”?  â”?  â”œâ”€â”€ User.js              # User model
â”?  â”?  â”œâ”€â”€ Team.js              # Team model
â”?  â”?  â”œâ”€â”€ Player.js            # Player model
â”?  â”?  â””â”€â”€ Match.js             # Match model
â”?  â”œâ”€â”€ routes/
â”?  â”?  â”œâ”€â”€ authRoutes.js        # Auth endpoints with Swagger docs
â”?  â”?  â”œâ”€â”€ teamRoutes.js        # Team endpoints with Swagger docs
â”?  â”?  â”œâ”€â”€ playerRoutes.js      # Player endpoints with Swagger docs
â”?  â”?  â”œâ”€â”€ matchRoutes.js       # Match endpoints with Swagger docs
â”?  â”?  â””â”€â”€ analyticsRoutes.js   # Analytics endpoints with Swagger docs
â”?  â”œâ”€â”€ scripts/
â”?  â”?  â””â”€â”€ seed.js              # Database seeding script
â”?  â”œâ”€â”€ app.js                   # Express app setup
â”?  â””â”€â”€ server.js                # Server entry point
â”œâ”€â”€ tests/
â”?  â””â”€â”€ api.test.js              # API integration tests
â”œâ”€â”€ .env                         # Environment variables
â”œâ”€â”€ .gitignore
â”œâ”€â”€ package.json
â””â”€â”€ README.md
```

## API Documentation

The full API documentation is available via Swagger UI at `/api-docs` when the server is running. A PDF version is also provided in the repository as `API_Documentation.pdf`.

## License

ISC


