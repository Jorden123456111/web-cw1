require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Team, Player, Match } = require('../src/models');

let token;
let teamId;
let playerId;
let matchId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register and login to get token
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', email: 'test@test.com', password: 'test123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@test.com', password: 'test123' });

  token = loginRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@test.com', password: 'pass123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('username', 'newuser');
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'another', email: 'test@test.com', password: 'pass123' });
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/profile - should return user profile with token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'test@test.com');
  });

  test('GET /api/auth/profile - should reject without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});

describe('Team Endpoints', () => {
  test('POST /api/teams - should create a team', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test FC', country: 'England', league: 'Premier League', founded: 2000, stadium: 'Test Arena' });
    expect(res.statusCode).toBe(201);
    expect(res.body.team).toHaveProperty('name', 'Test FC');
    teamId = res.body.team.id;
  });

  test('POST /api/teams - should reject without auth', async () => {
    const res = await request(app)
      .post('/api/teams')
      .send({ name: 'No Auth FC', country: 'England', league: 'Premier League' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/teams - should return all teams', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('teams');
    expect(res.body).toHaveProperty('pagination');
  });

  test('GET /api/teams/:id - should return a team by id', async () => {
    const res = await request(app).get(`/api/teams/${teamId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.team).toHaveProperty('name', 'Test FC');
  });

  test('GET /api/teams/:id - should return 404 for non-existent team', async () => {
    const res = await request(app).get('/api/teams/9999');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/teams/:id - should update a team', async () => {
    const res = await request(app)
      .put(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated FC' });
    expect(res.statusCode).toBe(200);
    expect(res.body.team).toHaveProperty('name', 'Updated FC');
  });
});

describe('Player Endpoints', () => {
  test('POST /api/players - should create a player', async () => {
    const res = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Player', nationality: 'England', position: 'Forward', teamId, goals: 10, appearances: 20 });
    expect(res.statusCode).toBe(201);
    playerId = res.body.player.id;
  });

  test('GET /api/players - should return all players', async () => {
    const res = await request(app).get('/api/players');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('players');
  });

  test('GET /api/players/:id - should return a player', async () => {
    const res = await request(app).get(`/api/players/${playerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.player).toHaveProperty('name', 'Test Player');
  });

  test('PUT /api/players/:id - should update a player', async () => {
    const res = await request(app)
      .put(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ goals: 15 });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/players/:id - should delete a player', async () => {
    const res = await request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Match Endpoints', () => {
  let team2Id;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Opponent FC', country: 'England', league: 'Premier League' });
    team2Id = res.body.team.id;
  });

  test('POST /api/matches - should create a match', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${token}`)
      .send({
        homeTeamId: teamId,
        awayTeamId: team2Id,
        homeScore: 2,
        awayScore: 1,
        matchDate: '2024-03-15',
        season: '2023-2024',
        competition: 'Premier League',
        venue: 'Test Arena',
        status: 'completed',
      });
    expect(res.statusCode).toBe(201);
    matchId = res.body.match.id;
  });

  test('POST /api/matches - should reject same home and away team', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${token}`)
      .send({
        homeTeamId: teamId,
        awayTeamId: teamId,
        matchDate: '2024-03-15',
        season: '2023-2024',
        competition: 'Premier League',
      });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/matches - should return all matches', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('matches');
  });

  test('GET /api/matches/:id - should return a match', async () => {
    const res = await request(app).get(`/api/matches/${matchId}`);
    expect(res.statusCode).toBe(200);
  });

  test('PUT /api/matches/:id - should update a match', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ homeScore: 3 });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/matches/:id - should delete a match', async () => {
    const res = await request(app)
      .delete(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Analytics Endpoints', () => {
  beforeAll(async () => {
    // Create some match data for analytics
    const teamRes1 = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Analytics FC', country: 'England', league: 'Test League' });
    const teamRes2 = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rival FC', country: 'England', league: 'Test League' });

    const t1 = teamRes1.body.team.id;
    const t2 = teamRes2.body.team.id;

    await request(app).post('/api/matches').set('Authorization', `Bearer ${token}`)
      .send({ homeTeamId: t1, awayTeamId: t2, homeScore: 3, awayScore: 1, matchDate: '2024-01-10', season: '2023-2024', competition: 'Test League', status: 'completed' });
    await request(app).post('/api/matches').set('Authorization', `Bearer ${token}`)
      .send({ homeTeamId: t2, awayTeamId: t1, homeScore: 0, awayScore: 2, matchDate: '2024-02-15', season: '2023-2024', competition: 'Test League', status: 'completed' });

    // Create a player for top scorers
    await request(app).post('/api/players').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Star Striker', nationality: 'Brazil', position: 'Forward', teamId: t1, goals: 25, assists: 10, appearances: 30 });
  });

  test('GET /api/analytics/leaderboard - should return standings', async () => {
    const res = await request(app).get('/api/analytics/leaderboard?season=2023-2024&competition=Test League');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('standings');
    expect(res.body.standings.length).toBe(2);
  });

  test('GET /api/analytics/leaderboard - should require parameters', async () => {
    const res = await request(app).get('/api/analytics/leaderboard');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/analytics/top-scorers - should return top scorers', async () => {
    const res = await request(app).get('/api/analytics/top-scorers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('topScorers');
  });

  test('GET /api/analytics/seasons/:season - should return season summary', async () => {
    const res = await request(app).get('/api/analytics/seasons/2023-2024');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalMatches');
    expect(res.body).toHaveProperty('goalsTrend');
  });
});

describe('Root & 404', () => {
  test('GET / - should return API info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Football Statistics API');
  });

  test('GET /nonexistent - should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});
