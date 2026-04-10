require('dotenv').config();
const { sequelize, User, Team, Player, Match } = require('../models');
const bcrypt = require('bcryptjs');

const teams = [
  { name: 'Manchester City', shortName: 'MCI', country: 'England', league: 'Premier League', founded: 1880, stadium: 'Etihad Stadium' },
  { name: 'Arsenal', shortName: 'ARS', country: 'England', league: 'Premier League', founded: 1886, stadium: 'Emirates Stadium' },
  { name: 'Liverpool', shortName: 'LIV', country: 'England', league: 'Premier League', founded: 1892, stadium: 'Anfield' },
  { name: 'Aston Villa', shortName: 'AVL', country: 'England', league: 'Premier League', founded: 1874, stadium: 'Villa Park' },
  { name: 'Tottenham Hotspur', shortName: 'TOT', country: 'England', league: 'Premier League', founded: 1882, stadium: 'Tottenham Hotspur Stadium' },
  { name: 'Chelsea', shortName: 'CHE', country: 'England', league: 'Premier League', founded: 1905, stadium: 'Stamford Bridge' },
  { name: 'Newcastle United', shortName: 'NEW', country: 'England', league: 'Premier League', founded: 1892, stadium: "St James' Park" },
  { name: 'Manchester United', shortName: 'MUN', country: 'England', league: 'Premier League', founded: 1878, stadium: 'Old Trafford' },
  { name: 'West Ham United', shortName: 'WHU', country: 'England', league: 'Premier League', founded: 1895, stadium: 'London Stadium' },
  { name: 'Brighton & Hove Albion', shortName: 'BHA', country: 'England', league: 'Premier League', founded: 1901, stadium: 'Amex Stadium' },
  { name: 'Wolverhampton Wanderers', shortName: 'WOL', country: 'England', league: 'Premier League', founded: 1877, stadium: 'Molineux Stadium' },
  { name: 'Crystal Palace', shortName: 'CRY', country: 'England', league: 'Premier League', founded: 1905, stadium: 'Selhurst Park' },
  { name: 'Bournemouth', shortName: 'BOU', country: 'England', league: 'Premier League', founded: 1899, stadium: 'Vitality Stadium' },
  { name: 'Fulham', shortName: 'FUL', country: 'England', league: 'Premier League', founded: 1879, stadium: 'Craven Cottage' },
  { name: 'Everton', shortName: 'EVE', country: 'England', league: 'Premier League', founded: 1878, stadium: 'Goodison Park' },
  { name: 'Brentford', shortName: 'BRE', country: 'England', league: 'Premier League', founded: 1889, stadium: 'Gtech Community Stadium' },
  { name: 'Nottingham Forest', shortName: 'NFO', country: 'England', league: 'Premier League', founded: 1865, stadium: 'City Ground' },
  { name: 'Luton Town', shortName: 'LUT', country: 'England', league: 'Premier League', founded: 1885, stadium: 'Kenilworth Road' },
  { name: 'Burnley', shortName: 'BUR', country: 'England', league: 'Premier League', founded: 1882, stadium: 'Turf Moor' },
  { name: 'Sheffield United', shortName: 'SHU', country: 'England', league: 'Premier League', founded: 1889, stadium: 'Bramall Lane' },
];

const playersData = [
  // Manchester City
  { name: 'Erling Haaland', nationality: 'Norway', position: 'Forward', dateOfBirth: '2000-07-21', shirtNumber: 9, goals: 27, assists: 5, appearances: 31, yellowCards: 3, redCards: 0, teamIndex: 0 },
  { name: 'Kevin De Bruyne', nationality: 'Belgium', position: 'Midfielder', dateOfBirth: '1991-06-28', shirtNumber: 17, goals: 4, assists: 10, appearances: 18, yellowCards: 2, redCards: 0, teamIndex: 0 },
  { name: 'Phil Foden', nationality: 'England', position: 'Midfielder', dateOfBirth: '2000-05-28', shirtNumber: 47, goals: 19, assists: 8, appearances: 35, yellowCards: 5, redCards: 0, teamIndex: 0 },
  { name: 'Ederson', nationality: 'Brazil', position: 'Goalkeeper', dateOfBirth: '1993-08-17', shirtNumber: 31, goals: 0, assists: 0, appearances: 33, yellowCards: 1, redCards: 0, teamIndex: 0 },
  { name: 'Ruben Dias', nationality: 'Portugal', position: 'Defender', dateOfBirth: '1997-05-14', shirtNumber: 3, goals: 1, assists: 1, appearances: 32, yellowCards: 6, redCards: 0, teamIndex: 0 },
  // Arsenal
  { name: 'Bukayo Saka', nationality: 'England', position: 'Forward', dateOfBirth: '2001-09-05', shirtNumber: 7, goals: 16, assists: 9, appearances: 33, yellowCards: 4, redCards: 0, teamIndex: 1 },
  { name: 'Martin Odegaard', nationality: 'Norway', position: 'Midfielder', dateOfBirth: '1998-12-17', shirtNumber: 8, goals: 8, assists: 10, appearances: 33, yellowCards: 3, redCards: 0, teamIndex: 1 },
  { name: 'Kai Havertz', nationality: 'Germany', position: 'Forward', dateOfBirth: '1999-06-11', shirtNumber: 29, goals: 13, assists: 5, appearances: 37, yellowCards: 7, redCards: 0, teamIndex: 1 },
  { name: 'David Raya', nationality: 'Spain', position: 'Goalkeeper', dateOfBirth: '1995-09-15', shirtNumber: 22, goals: 0, assists: 0, appearances: 32, yellowCards: 1, redCards: 0, teamIndex: 1 },
  { name: 'William Saliba', nationality: 'France', position: 'Defender', dateOfBirth: '2001-03-24', shirtNumber: 12, goals: 2, assists: 0, appearances: 34, yellowCards: 5, redCards: 0, teamIndex: 1 },
  // Liverpool
  { name: 'Mohamed Salah', nationality: 'Egypt', position: 'Forward', dateOfBirth: '1992-06-15', shirtNumber: 11, goals: 18, assists: 10, appearances: 32, yellowCards: 1, redCards: 0, teamIndex: 2 },
  { name: 'Darwin Nunez', nationality: 'Uruguay', position: 'Forward', dateOfBirth: '1999-06-24', shirtNumber: 9, goals: 11, assists: 8, appearances: 36, yellowCards: 6, redCards: 1, teamIndex: 2 },
  { name: 'Virgil van Dijk', nationality: 'Netherlands', position: 'Defender', dateOfBirth: '1991-07-08', shirtNumber: 4, goals: 2, assists: 2, appearances: 33, yellowCards: 4, redCards: 0, teamIndex: 2 },
  { name: 'Alisson', nationality: 'Brazil', position: 'Goalkeeper', dateOfBirth: '1992-10-02', shirtNumber: 1, goals: 0, assists: 1, appearances: 28, yellowCards: 0, redCards: 0, teamIndex: 2 },
  { name: 'Trent Alexander-Arnold', nationality: 'England', position: 'Defender', dateOfBirth: '1998-10-07', shirtNumber: 66, goals: 3, assists: 9, appearances: 28, yellowCards: 3, redCards: 0, teamIndex: 2 },
  // Aston Villa
  { name: 'Ollie Watkins', nationality: 'England', position: 'Forward', dateOfBirth: '1995-12-30', shirtNumber: 11, goals: 19, assists: 13, appearances: 37, yellowCards: 3, redCards: 0, teamIndex: 3 },
  { name: 'Leon Bailey', nationality: 'Jamaica', position: 'Forward', dateOfBirth: '1997-08-09', shirtNumber: 31, goals: 10, assists: 6, appearances: 30, yellowCards: 2, redCards: 0, teamIndex: 3 },
  // Tottenham
  { name: 'Son Heung-min', nationality: 'South Korea', position: 'Forward', dateOfBirth: '1992-07-08', shirtNumber: 7, goals: 17, assists: 10, appearances: 35, yellowCards: 1, redCards: 0, teamIndex: 4 },
  { name: 'James Maddison', nationality: 'England', position: 'Midfielder', dateOfBirth: '1996-11-23', shirtNumber: 10, goals: 4, assists: 8, appearances: 24, yellowCards: 5, redCards: 0, teamIndex: 4 },
  // Chelsea
  { name: 'Cole Palmer', nationality: 'England', position: 'Midfielder', dateOfBirth: '2002-05-06', shirtNumber: 20, goals: 22, assists: 11, appearances: 34, yellowCards: 2, redCards: 0, teamIndex: 5 },
  { name: 'Nicolas Jackson', nationality: 'Senegal', position: 'Forward', dateOfBirth: '2001-06-20', shirtNumber: 15, goals: 14, assists: 5, appearances: 35, yellowCards: 8, redCards: 0, teamIndex: 5 },
  // Newcastle
  { name: 'Alexander Isak', nationality: 'Sweden', position: 'Forward', dateOfBirth: '1999-09-21', shirtNumber: 14, goals: 21, assists: 3, appearances: 30, yellowCards: 2, redCards: 0, teamIndex: 6 },
  { name: 'Bruno Guimaraes', nationality: 'Brazil', position: 'Midfielder', dateOfBirth: '1997-11-16', shirtNumber: 39, goals: 7, assists: 5, appearances: 37, yellowCards: 8, redCards: 0, teamIndex: 6 },
  // Manchester United
  { name: 'Marcus Rashford', nationality: 'England', position: 'Forward', dateOfBirth: '1997-10-31', shirtNumber: 10, goals: 7, assists: 2, appearances: 33, yellowCards: 4, redCards: 0, teamIndex: 7 },
  { name: 'Bruno Fernandes', nationality: 'Portugal', position: 'Midfielder', dateOfBirth: '1994-09-08', shirtNumber: 8, goals: 10, assists: 8, appearances: 36, yellowCards: 9, redCards: 0, teamIndex: 7 },
  // West Ham
  { name: 'Jarrod Bowen', nationality: 'England', position: 'Forward', dateOfBirth: '1996-12-20', shirtNumber: 20, goals: 12, assists: 6, appearances: 33, yellowCards: 3, redCards: 0, teamIndex: 8 },
  // Brighton
  { name: 'Joao Pedro', nationality: 'Brazil', position: 'Forward', dateOfBirth: '2001-09-26', shirtNumber: 9, goals: 9, assists: 4, appearances: 30, yellowCards: 3, redCards: 0, teamIndex: 9 },
  // Crystal Palace
  { name: 'Eberechi Eze', nationality: 'England', position: 'Midfielder', dateOfBirth: '1998-06-29', shirtNumber: 10, goals: 11, assists: 4, appearances: 31, yellowCards: 4, redCards: 0, teamIndex: 11 },
  // Fulham
  { name: 'Rodrigo Muniz', nationality: 'Brazil', position: 'Forward', dateOfBirth: '2001-05-04', shirtNumber: 9, goals: 9, assists: 2, appearances: 32, yellowCards: 5, redCards: 0, teamIndex: 13 },
  // Brentford
  { name: 'Ivan Toney', nationality: 'England', position: 'Forward', dateOfBirth: '1996-03-16', shirtNumber: 17, goals: 4, assists: 2, appearances: 17, yellowCards: 1, redCards: 0, teamIndex: 15 },
];

// Generate realistic match results for the 2023-2024 season
function generateMatches(teamIds) {
  const matches = [];
  const season = '2023-2024';
  const competition = 'Premier League';
  const referees = ['Michael Oliver', 'Anthony Taylor', 'Paul Tierney', 'Simon Hooper', 'Chris Kavanagh', 'Craig Pawson', 'Robert Jones', 'John Brooks', 'David Coote', 'Andy Madley'];
  
  // Each team plays every other team twice (home and away)
  let matchDate = new Date('2023-08-12');
  
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = 0; j < teamIds.length; j++) {
      if (i === j) continue;
      
      // Randomise scores with realistic distribution
      const homeAdvantage = Math.random();
      let homeScore, awayScore;
      
      if (homeAdvantage < 0.45) {
        // Home win
        homeScore = Math.floor(Math.random() * 3) + 1;
        awayScore = Math.floor(Math.random() * homeScore);
      } else if (homeAdvantage < 0.72) {
        // Draw
        const drawScore = Math.floor(Math.random() * 3);
        homeScore = drawScore;
        awayScore = drawScore;
      } else {
        // Away win
        awayScore = Math.floor(Math.random() * 3) + 1;
        homeScore = Math.floor(Math.random() * awayScore);
      }
      
      matches.push({
        homeTeamId: teamIds[i],
        awayTeamId: teamIds[j],
        homeScore,
        awayScore,
        matchDate: matchDate.toISOString().split('T')[0],
        season,
        competition,
        venue: teams[i].stadium,
        referee: referees[Math.floor(Math.random() * referees.length)],
        status: 'completed',
      });
      
      // Advance date by 1-4 days
      matchDate = new Date(matchDate.getTime() + (1 + Math.floor(Math.random() * 3)) * 86400000);
      
      // Skip if we go past May 2024
      if (matchDate > new Date('2024-05-19')) {
        matchDate = new Date('2023-08-12');
      }
    }
  }
  
  return matches;
}

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset and synced.');

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@footballstats.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created (admin@footballstats.com / admin123).');

    // Create demo user
    await User.create({
      username: 'demo_user',
      email: 'demo@footballstats.com',
      password: 'demo123',
      role: 'user',
    });
    console.log('Demo user created (demo@footballstats.com / demo123).');

    // Create teams
    const createdTeams = await Team.bulkCreate(teams);
    const teamIds = createdTeams.map((t) => t.id);
    console.log(`${createdTeams.length} teams created.`);

    // Create players
    const players = playersData.map((p) => ({
      ...p,
      teamId: teamIds[p.teamIndex],
    }));
    // Remove teamIndex before inserting
    const cleanPlayers = players.map(({ teamIndex, ...rest }) => rest);
    await Player.bulkCreate(cleanPlayers);
    console.log(`${cleanPlayers.length} players created.`);

    // Generate and create matches
    const matches = generateMatches(teamIds);
    // Insert in batches of 100
    for (let i = 0; i < matches.length; i += 100) {
      await Match.bulkCreate(matches.slice(i, i + 100));
    }
    console.log(`${matches.length} matches created.`);

    console.log('\nSeeding completed successfully!');
    console.log('You can now start the server with: npm start');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
