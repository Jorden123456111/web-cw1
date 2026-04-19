# Football Statistics API â€?Documentation

**Base URL:** `http://localhost:3000`
**Interactive Docs:** `http://localhost:3000/api-docs` (Swagger UI)

---

## Authentication

The API uses **JSON Web Tokens (JWT)** for authentication. Create and update operations (POST, PUT) require a valid token, while delete operations require an authenticated admin user. Read operations (GET) are public.

To obtain a token, register a user account and then log in. Include the token in subsequent requests via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 24 hours by default.

---

## Error Handling

All error responses follow a consistent JSON format:

```json
{
  "error": "Human-readable error message",
  "details": ["Optional array of field-level errors"]
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Authentication required or invalid token |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal server error |

---

## Endpoints

### 1. Authentication

#### POST `/api/auth/register`

Register a new user account. The API always assigns `role: "user"` at registration.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | string | Yes | 3â€?0 characters |
| email | string | Yes | Valid email format |
| password | string | Yes | Minimum 6 characters |

**Response (201):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-04-10T12:00:00.000Z",
    "updatedAt": "2026-04-10T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error (409):** `{ "error": "Email already registered." }`

---

#### POST `/api/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "user": { "id": 1, "username": "john_doe", "email": "john@example.com", "role": "user" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error (401):** `{ "error": "Invalid email or password." }`

---

#### GET `/api/auth/profile`

Get the authenticated user's profile. **Requires authentication.**

**Response (200):**
```json
{
  "user": { "id": 1, "username": "john_doe", "email": "john@example.com", "role": "user" }
}
```

---

### 2. Teams

#### GET `/api/teams`

List all teams with pagination and optional filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| country | string | â€?| Filter by country |
| league | string | â€?| Filter by league name |
| search | string | â€?| Search by team name (partial match) |

**Response (200):**
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Manchester City",
      "shortName": "MCI",
      "country": "England",
      "league": "Premier League",
      "founded": 1880,
      "stadium": "Etihad Stadium",
      "logoUrl": null,
      "createdAt": "2026-04-10T12:00:00.000Z",
      "updatedAt": "2026-04-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### GET `/api/teams/:id`

Get a single team by ID, including its players.

**Response (200):**
```json
{
  "team": {
    "id": 1,
    "name": "Manchester City",
    "shortName": "MCI",
    "country": "England",
    "league": "Premier League",
    "founded": 1880,
    "stadium": "Etihad Stadium",
    "players": [
      { "id": 1, "name": "Erling Haaland", "position": "Forward", "goals": 27 }
    ]
  }
}
```

**Error (404):** `{ "error": "Team not found." }`

---

#### POST `/api/teams` *(Auth required)*

Create a new team.

**Request Body:**
```json
{
  "name": "Leeds United",
  "shortName": "LEE",
  "country": "England",
  "league": "Championship",
  "founded": 1919,
  "stadium": "Elland Road"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| shortName | string | No |
| country | string | Yes |
| league | string | Yes |
| founded | integer | No |
| stadium | string | No |
| logoUrl | string | No |

**Response (201):**
```json
{
  "message": "Team created successfully.",
  "team": { "id": 21, "name": "Leeds United", "..." : "..." }
}
```

---

#### PUT `/api/teams/:id` *(Auth required)*

Update an existing team. Send only the fields you want to change.

**Response (200):**
```json
{
  "message": "Team updated successfully.",
  "team": { "id": 21, "name": "Updated Name", "..." : "..." }
}
```

---

#### DELETE `/api/teams/:id` *(Auth + Admin required)*

Delete a team.

**Response (200):** `{ "message": "Team deleted successfully." }`

---

### 3. Players

#### GET `/api/players`

List all players with pagination and optional filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| position | string | â€?| Filter by position: `Goalkeeper`, `Defender`, `Midfielder`, `Forward` |
| nationality | string | â€?| Filter by nationality |
| teamId | integer | â€?| Filter by team ID |
| search | string | â€?| Search by player name |

**Response (200):**
```json
{
  "players": [
    {
      "id": 1,
      "name": "Erling Haaland",
      "nationality": "Norway",
      "position": "Forward",
      "dateOfBirth": "2000-07-21",
      "shirtNumber": 9,
      "goals": 27,
      "assists": 5,
      "appearances": 31,
      "yellowCards": 3,
      "redCards": 0,
      "teamId": 1,
      "team": { "id": 1, "name": "Manchester City", "shortName": "MCI" }
    }
  ],
  "pagination": { "total": 30, "page": 1, "limit": 20, "totalPages": 2 }
}
```

---

#### GET `/api/players/:id`

Get a single player with team details.

**Response (200):**
```json
{
  "player": {
    "id": 1,
    "name": "Erling Haaland",
    "position": "Forward",
    "team": { "id": 1, "name": "Manchester City" }
  }
}
```

---

#### POST `/api/players` *(Auth required)*

Create a new player.

**Request Body:**
```json
{
  "name": "Marcus Rashford",
  "nationality": "England",
  "position": "Forward",
  "dateOfBirth": "1997-10-31",
  "shirtNumber": 10,
  "goals": 7,
  "assists": 2,
  "appearances": 33,
  "yellowCards": 4,
  "redCards": 0,
  "teamId": 8
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| nationality | string | Yes |
| position | string | Yes (`Goalkeeper`, `Defender`, `Midfielder`, `Forward`) |
| dateOfBirth | date (YYYY-MM-DD) | No |
| shirtNumber | integer | No |
| goals | integer | No (default 0) |
| assists | integer | No (default 0) |
| appearances | integer | No (default 0) |
| yellowCards | integer | No (default 0) |
| redCards | integer | No (default 0) |
| teamId | integer | No |

**Response (201):** `{ "message": "Player created successfully.", "player": { ... } }`

---

#### PUT `/api/players/:id` *(Auth required)*

Update a player. Send only changed fields.

**Response (200):** `{ "message": "Player updated successfully.", "player": { ... } }`

---

#### DELETE `/api/players/:id` *(Auth + Admin required)*

**Response (200):** `{ "message": "Player deleted successfully." }`

---

### 4. Matches

#### GET `/api/matches`

List matches with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| season | string | â€?| e.g. `"2023-2024"` |
| competition | string | â€?| e.g. `"Premier League"` |
| status | string | â€?| `scheduled`, `completed`, `cancelled`, `postponed` |
| teamId | integer | â€?| Matches involving this team (home or away) |

**Response (200):**
```json
{
  "matches": [
    {
      "id": 1,
      "homeTeamId": 1,
      "awayTeamId": 2,
      "homeScore": 2,
      "awayScore": 1,
      "matchDate": "2023-08-12",
      "season": "2023-2024",
      "competition": "Premier League",
      "venue": "Etihad Stadium",
      "referee": "Michael Oliver",
      "status": "completed",
      "homeTeam": { "id": 1, "name": "Manchester City", "shortName": "MCI" },
      "awayTeam": { "id": 2, "name": "Arsenal", "shortName": "ARS" }
    }
  ],
  "pagination": { "total": 380, "page": 1, "limit": 20, "totalPages": 19 }
}
```

---

#### GET `/api/matches/:id`

Get match details with full team information.

---

#### POST `/api/matches` *(Auth required)*

Create a new match record.

**Request Body:**
```json
{
  "homeTeamId": 1,
  "awayTeamId": 2,
  "homeScore": 2,
  "awayScore": 1,
  "matchDate": "2024-03-15",
  "season": "2023-2024",
  "competition": "Premier League",
  "venue": "Etihad Stadium",
  "referee": "Michael Oliver",
  "status": "completed"
}
```

| Field | Type | Required |
|-------|------|----------|
| homeTeamId | integer | Yes |
| awayTeamId | integer | Yes (must differ from homeTeamId) |
| homeScore | integer | No (default 0) |
| awayScore | integer | No (default 0) |
| matchDate | date (YYYY-MM-DD) | Yes |
| season | string | Yes |
| competition | string | Yes |
| venue | string | No |
| referee | string | No |
| status | string | No (default `"completed"`) |

**Response (201):** `{ "message": "Match created successfully.", "match": { ... } }`

**Error (400):** `{ "error": "Home team and away team must be different." }`

---

#### PUT `/api/matches/:id` *(Auth required)*

Update a match. **Response (200).**

#### DELETE `/api/matches/:id` *(Auth + Admin required)*

Delete a match. **Response (200).**

---

### 5. Analytics

#### GET `/api/analytics/leaderboard`

Compute league standings from completed match results.

**Query Parameters (both required):**

| Parameter | Type | Description |
|-----------|------|-------------|
| season | string | e.g. `"2023-2024"` |
| competition | string | e.g. `"Premier League"` |

**Response (200):**
```json
{
  "season": "2023-2024",
  "competition": "Premier League",
  "totalMatches": 380,
  "standings": [
    {
      "rank": 1,
      "teamId": 1,
      "teamName": "Manchester City",
      "shortName": "MCI",
      "played": 38,
      "wins": 25,
      "draws": 7,
      "losses": 6,
      "goalsFor": 78,
      "goalsAgainst": 34,
      "goalDifference": 44,
      "points": 82
    }
  ]
}
```

---

#### GET `/api/analytics/top-scorers`

Retrieve top goal scorers ranked by goals (then assists as tiebreaker).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 10 | Number of players to return |
| position | string | â€?| Filter by position |
| teamId | integer | â€?| Filter by team |

**Response (200):**
```json
{
  "topScorers": [
    {
      "rank": 1,
      "playerId": 1,
      "name": "Erling Haaland",
      "team": "Manchester City",
      "position": "Forward",
      "goals": 27,
      "assists": 5,
      "appearances": 31,
      "goalsPerGame": 0.87
    }
  ]
}
```

---

#### GET `/api/analytics/teams/:id/performance`

Detailed performance summary for a specific team.

**Query Parameters (optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| season | string | Filter by season |
| competition | string | Filter by competition |

**Response (200):**
```json
{
  "team": { "id": 1, "name": "Manchester City" },
  "filters": { "season": "2023-2024", "competition": "all" },
  "stats": {
    "played": 38,
    "wins": 25,
    "draws": 7,
    "losses": 6,
    "goalsFor": 78,
    "goalsAgainst": 34,
    "goalDifference": 44,
    "winRate": 65.8,
    "avgGoalsScored": 2.05,
    "avgGoalsConceded": 0.89,
    "cleanSheets": 14
  },
  "recentForm": ["W", "W", "D", "W", "L"]
}
```

---

#### GET `/api/analytics/head-to-head`

Compare historical results between two teams.

**Query Parameters (both required):**

| Parameter | Type | Description |
|-----------|------|-------------|
| team1Id | integer | First team ID |
| team2Id | integer | Second team ID |

**Response (200):**
```json
{
  "team1": { "id": 1, "name": "Manchester City", "wins": 5, "goals": 14 },
  "team2": { "id": 2, "name": "Arsenal", "wins": 3, "goals": 9 },
  "draws": 2,
  "totalMatches": 10,
  "matches": [
    {
      "id": 42,
      "date": "2024-03-15",
      "homeTeam": "Manchester City",
      "awayTeam": "Arsenal",
      "score": "2 - 1",
      "competition": "Premier League"
    }
  ]
}
```

---

#### GET `/api/analytics/seasons/:season`

Season-level summary with monthly goal trends.

**Response (200):**
```json
{
  "season": "2023-2024",
  "totalMatches": 380,
  "totalGoals": 1024,
  "avgGoalsPerMatch": 2.69,
  "results": { "homeWins": 171, "awayWins": 114, "draws": 95 },
  "homeWinPercentage": 45.0,
  "highestScoringMatch": {
    "id": 156,
    "date": "2024-01-20",
    "score": "5 - 4",
    "totalGoals": 9
  },
  "goalsTrend": [
    { "month": "2023-08", "matches": 30, "totalGoals": 82, "avgGoalsPerMatch": 2.73 },
    { "month": "2023-09", "matches": 35, "totalGoals": 95, "avgGoalsPerMatch": 2.71 }
  ]
}
```

---

## Running the API

```bash
npm install          # Install dependencies
npm run seed         # Populate database with sample data
npm start            # Start server on port 3000
npm test             # Run 39 integration tests
```

**Default accounts after seeding:**
- Admin: `admin@footballstats.com` / `admin123`
- Demo: `demo@footballstats.com` / `demo123`




