require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

let userToken;
let adminToken;
let teamId;
let playerId;
let matchId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register and login a regular user.
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', email: 'test@test.com', password: 'test123' });

  const userLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@test.com', password: 'test123' });
  userToken = userLoginRes.body.token;

  // Seed an admin user for role-based authorization checks.
  await User.create({
    username: 'adminuser',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  });

  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  adminToken = adminLoginRes.body.token;
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
    expect(res.body.user).toHaveProperty('role', 'user');
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/register - should ignore role escalation attempts', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'hacker', email: 'hacker@test.com', password: 'pass123', role: 'admin' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('role', 'user');
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
      .set('Authorization', `Bearer ${userToken}`);
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
      .set('Authorization', `Bearer ${userToken}`)
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated FC' });
    expect(res.statusCode).toBe(200);
    expect(res.body.team).toHaveProperty('name', 'Updated FC');
  });

  test('DELETE /api/teams/:id - should reject non-admin users', async () => {
    const res = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/teams/:id - should validate id format', async () => {
    const res = await request(app)
      .delete('/api/teams/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });
});

describe('Player Endpoints', () => {
  test('POST /api/players - should create a player', async () => {
    const res = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${userToken}`)
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ goals: 15 });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/players/:id - should reject non-admin users', async () => {
    const res = await request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/players/:id - should validate id format', async () => {
    const res = await request(app)
      .delete('/api/players/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/players/:id - should delete player with admin token', async () => {
    const res = await request(app)
      .delete(`/api/players/${playerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Match Endpoints', () => {
  let team2Id;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Opponent FC', country: 'England', league: 'Premier League' });
    team2Id = res.body.team.id;
  });

  test('POST /api/matches - should create a match', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${userToken}`)
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
      .set('Authorization', `Bearer ${userToken}`)
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ homeScore: 3 });
    expect(res.statusCode).toBe(200);
  });

  test('PUT /api/matches/:id - should reject same home and away teams on update', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ homeTeamId: teamId, awayTeamId: teamId });
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/matches/:id - should reject non-admin users', async () => {
    const res = await request(app)
      .delete(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/matches/:id - should validate id format', async () => {
    const res = await request(app)
      .delete('/api/matches/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/matches/:id - should delete with admin token', async () => {
    const res = await request(app)
      .delete(`/api/matches/${matchId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Analytics Endpoints', () => {
  let analyticsTeam1Id;
  let analyticsTeam2Id;

  beforeAll(async () => {
    const teamRes1 = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Analytics FC', country: 'England', league: 'Test League' });
    const teamRes2 = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Rival FC', country: 'England', league: 'Test League' });

    analyticsTeam1Id = teamRes1.body.team.id;
    analyticsTeam2Id = teamRes2.body.team.id;

    await request(app).post('/api/matches').set('Authorization', `Bearer ${userToken}`)
      .send({
        homeTeamId: analyticsTeam1Id,
        awayTeamId: analyticsTeam2Id,
        homeScore: 3,
        awayScore: 1,
        matchDate: '2024-01-10',
        season: '2023-2024',
        competition: 'Test League',
        status: 'completed',
      });

    await request(app).post('/api/matches').set('Authorization', `Bearer ${userToken}`)
      .send({
        homeTeamId: analyticsTeam2Id,
        awayTeamId: analyticsTeam1Id,
        homeScore: 0,
        awayScore: 2,
        matchDate: '2024-02-15',
        season: '2023-2024',
        competition: 'Test League',
        status: 'completed',
      });

    await request(app).post('/api/players').set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Star Striker',
        nationality: 'Brazil',
        position: 'Forward',
        teamId: analyticsTeam1Id,
        goals: 25,
        assists: 10,
        appearances: 30,
      });
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

  test('GET /api/analytics/teams/:id/performance - should return team performance', async () => {
    const res = await request(app).get(`/api/analytics/teams/${analyticsTeam1Id}/performance?season=2023-2024&competition=Test League`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('stats');
    expect(res.body.stats).toHaveProperty('played');
  });

  test('GET /api/analytics/head-to-head - should return head-to-head comparison', async () => {
    const res = await request(app).get(`/api/analytics/head-to-head?team1Id=${analyticsTeam1Id}&team2Id=${analyticsTeam2Id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalMatches');
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
