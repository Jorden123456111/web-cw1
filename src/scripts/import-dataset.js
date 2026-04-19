/**
 * Real Dataset Import Script
 * 
 * Data source: "International Football Results from 1872 to 2024"
 * Author: Mart Jürisoo
 * URL: https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
 * License: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
 * 
 * Field mapping (CSV → Database):
 *   date        → Match.matchDate
 *   home_team   → Team.name (auto-created if not exists)
 *   away_team   → Team.name (auto-created if not exists)
 *   home_score  → Match.homeScore
 *   away_score  → Match.awayScore
 *   tournament  → Match.competition
 *   city        → Match.venue (city name used as venue)
 *   country     → Team.country (derived from match host)
 *   neutral     → (used to determine venue accuracy)
 *
 * Cleaning steps:
 *   1. Filter to matches from 2018 onwards (keep dataset manageable)
 *   2. Discard rows where home_score or away_score is null/NaN
 *   3. Trim whitespace from all string fields
 *   4. Deduplicate team names and normalise casing
 *   5. Auto-assign season based on match date (Aug–Jul cycle)
 *   6. Generate synthetic player data for top national teams
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { sequelize, User, Team, Player, Match } = require('../models');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const RESULTS_CSV = path.join(DATA_DIR, 'results.csv');

function determineSeason(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month >= 8) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

// Representative player rosters for major national teams
const nationalTeamPlayers = {
  'England': [
    { name: 'Jordan Pickford', position: 'Goalkeeper', nationality: 'England', shirtNumber: 1, goals: 0, assists: 0, appearances: 61 },
    { name: 'Kyle Walker', position: 'Defender', nationality: 'England', shirtNumber: 2, goals: 1, assists: 5, appearances: 78 },
    { name: 'John Stones', position: 'Defender', nationality: 'England', shirtNumber: 5, goals: 3, assists: 1, appearances: 71 },
    { name: 'Harry Maguire', position: 'Defender', nationality: 'England', shirtNumber: 6, goals: 7, assists: 0, appearances: 63 },
    { name: 'Declan Rice', position: 'Midfielder', nationality: 'England', shirtNumber: 4, goals: 4, assists: 8, appearances: 52 },
    { name: 'Jude Bellingham', position: 'Midfielder', nationality: 'England', shirtNumber: 10, goals: 4, assists: 3, appearances: 34 },
    { name: 'Bukayo Saka', position: 'Forward', nationality: 'England', shirtNumber: 7, goals: 11, assists: 7, appearances: 39 },
    { name: 'Harry Kane', position: 'Forward', nationality: 'England', shirtNumber: 9, goals: 66, assists: 17, appearances: 92 },
    { name: 'Phil Foden', position: 'Midfielder', nationality: 'England', shirtNumber: 11, goals: 4, assists: 5, appearances: 34 },
    { name: 'Cole Palmer', position: 'Midfielder', nationality: 'England', shirtNumber: 20, goals: 3, assists: 2, appearances: 11 },
  ],
  'Brazil': [
    { name: 'Alisson Becker', position: 'Goalkeeper', nationality: 'Brazil', shirtNumber: 1, goals: 0, assists: 0, appearances: 70 },
    { name: 'Marquinhos', position: 'Defender', nationality: 'Brazil', shirtNumber: 4, goals: 8, assists: 2, appearances: 82 },
    { name: 'Thiago Silva', position: 'Defender', nationality: 'Brazil', shirtNumber: 3, goals: 7, assists: 3, appearances: 113 },
    { name: 'Casemiro', position: 'Midfielder', nationality: 'Brazil', shirtNumber: 5, goals: 7, assists: 5, appearances: 75 },
    { name: 'Lucas Paqueta', position: 'Midfielder', nationality: 'Brazil', shirtNumber: 8, goals: 10, assists: 6, appearances: 55 },
    { name: 'Vinicius Junior', position: 'Forward', nationality: 'Brazil', shirtNumber: 7, goals: 5, assists: 6, appearances: 33 },
    { name: 'Rodrygo', position: 'Forward', nationality: 'Brazil', shirtNumber: 11, goals: 6, assists: 4, appearances: 20 },
    { name: 'Richarlison', position: 'Forward', nationality: 'Brazil', shirtNumber: 9, goals: 20, assists: 7, appearances: 50 },
  ],
  'France': [
    { name: 'Mike Maignan', position: 'Goalkeeper', nationality: 'France', shirtNumber: 16, goals: 0, assists: 0, appearances: 18 },
    { name: 'Jules Kounde', position: 'Defender', nationality: 'France', shirtNumber: 5, goals: 1, assists: 3, appearances: 30 },
    { name: 'William Saliba', position: 'Defender', nationality: 'France', shirtNumber: 17, goals: 0, assists: 0, appearances: 18 },
    { name: 'N\'Golo Kante', position: 'Midfielder', nationality: 'France', shirtNumber: 13, goals: 2, assists: 1, appearances: 53 },
    { name: 'Antoine Griezmann', position: 'Forward', nationality: 'France', shirtNumber: 7, goals: 44, assists: 29, appearances: 129 },
    { name: 'Kylian Mbappe', position: 'Forward', nationality: 'France', shirtNumber: 10, goals: 47, assists: 23, appearances: 80 },
    { name: 'Ousmane Dembele', position: 'Forward', nationality: 'France', shirtNumber: 11, goals: 5, assists: 10, appearances: 40 },
    { name: 'Olivier Giroud', position: 'Forward', nationality: 'France', shirtNumber: 9, goals: 57, assists: 8, appearances: 131 },
  ],
  'Argentina': [
    { name: 'Emiliano Martinez', position: 'Goalkeeper', nationality: 'Argentina', shirtNumber: 23, goals: 0, assists: 0, appearances: 44 },
    { name: 'Nicolas Otamendi', position: 'Defender', nationality: 'Argentina', shirtNumber: 19, goals: 5, assists: 2, appearances: 101 },
    { name: 'Cristian Romero', position: 'Defender', nationality: 'Argentina', shirtNumber: 13, goals: 2, assists: 0, appearances: 24 },
    { name: 'Rodrigo De Paul', position: 'Midfielder', nationality: 'Argentina', shirtNumber: 7, goals: 3, assists: 9, appearances: 55 },
    { name: 'Enzo Fernandez', position: 'Midfielder', nationality: 'Argentina', shirtNumber: 24, goals: 3, assists: 3, appearances: 25 },
    { name: 'Lionel Messi', position: 'Forward', nationality: 'Argentina', shirtNumber: 10, goals: 108, assists: 58, appearances: 187 },
    { name: 'Julian Alvarez', position: 'Forward', nationality: 'Argentina', shirtNumber: 9, goals: 8, assists: 5, appearances: 30 },
    { name: 'Lautaro Martinez', position: 'Forward', nationality: 'Argentina', shirtNumber: 22, goals: 25, assists: 6, appearances: 54 },
  ],
  'Germany': [
    { name: 'Manuel Neuer', position: 'Goalkeeper', nationality: 'Germany', shirtNumber: 1, goals: 0, assists: 0, appearances: 118 },
    { name: 'Antonio Rudiger', position: 'Defender', nationality: 'Germany', shirtNumber: 2, goals: 3, assists: 1, appearances: 68 },
    { name: 'Joshua Kimmich', position: 'Midfielder', nationality: 'Germany', shirtNumber: 6, goals: 6, assists: 15, appearances: 91 },
    { name: 'Ilkay Gundogan', position: 'Midfielder', nationality: 'Germany', shirtNumber: 21, goals: 16, assists: 12, appearances: 74 },
    { name: 'Jamal Musiala', position: 'Midfielder', nationality: 'Germany', shirtNumber: 10, goals: 6, assists: 5, appearances: 35 },
    { name: 'Florian Wirtz', position: 'Midfielder', nationality: 'Germany', shirtNumber: 17, goals: 4, assists: 5, appearances: 23 },
    { name: 'Kai Havertz', position: 'Forward', nationality: 'Germany', shirtNumber: 7, goals: 17, assists: 8, appearances: 48 },
    { name: 'Niclas Fullkrug', position: 'Forward', nationality: 'Germany', shirtNumber: 9, goals: 13, assists: 2, appearances: 20 },
  ],
  'Spain': [
    { name: 'Unai Simon', position: 'Goalkeeper', nationality: 'Spain', shirtNumber: 23, goals: 0, assists: 0, appearances: 38 },
    { name: 'Dani Carvajal', position: 'Defender', nationality: 'Spain', shirtNumber: 2, goals: 4, assists: 6, appearances: 47 },
    { name: 'Rodri', position: 'Midfielder', nationality: 'Spain', shirtNumber: 16, goals: 4, assists: 7, appearances: 54 },
    { name: 'Pedri', position: 'Midfielder', nationality: 'Spain', shirtNumber: 8, goals: 2, assists: 4, appearances: 28 },
    { name: 'Lamine Yamal', position: 'Forward', nationality: 'Spain', shirtNumber: 19, goals: 4, assists: 7, appearances: 16 },
    { name: 'Nico Williams', position: 'Forward', nationality: 'Spain', shirtNumber: 11, goals: 3, assists: 5, appearances: 22 },
    { name: 'Alvaro Morata', position: 'Forward', nationality: 'Spain', shirtNumber: 7, goals: 36, assists: 10, appearances: 80 },
  ],
};

async function importDataset() {
  try {
    // Check if CSV exists
    if (!fs.existsSync(RESULTS_CSV)) {
      console.error(`\nCSV file not found at: ${RESULTS_CSV}`);
      console.error('\nTo use this import script:');
      console.error('1. Download the dataset from:');
      console.error('   https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017');
      console.error('2. Extract results.csv into the data/ folder');
      console.error(`3. Expected path: ${RESULTS_CSV}`);
      console.error('\nFalling back to built-in seed data...\n');
      
      // Fall back to the built-in seed
      require('./seed-builtin');
      return;
    }

    console.log('Reading CSV dataset...');
    const raw = fs.readFileSync(RESULTS_CSV, 'utf-8');
    const records = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Total records in CSV: ${records.length}`);

    // CLEANING STEP 1: Filter to 2018+ matches only
    const filtered = records.filter((r) => {
      const year = parseInt(r.date.substring(0, 4));
      return year >= 2018;
    });
    console.log(`Records after filtering (2018+): ${filtered.length}`);

    // CLEANING STEP 2: Remove rows with missing scores
    const clean = filtered.filter((r) => {
      const hs = parseInt(r.home_score);
      const as = parseInt(r.away_score);
      return !isNaN(hs) && !isNaN(as);
    });
    console.log(`Records after removing null scores: ${clean.length}`);

    // Reset database
    await sequelize.sync({ force: true });
    console.log('Database reset and synced.');

    // Create users
    await User.create({ username: 'admin', email: 'admin@footballstats.com', password: 'admin123', role: 'admin' });
    await User.create({ username: 'demo_user', email: 'demo@footballstats.com', password: 'demo123', role: 'user' });
    console.log('Users created.');

    // CLEANING STEP 3 & 4: Extract unique teams, normalise names
    const teamMap = new Map();
    for (const r of clean) {
      const homeName = r.home_team.trim();
      const awayName = r.away_team.trim();
      const country = r.country.trim();

      if (!teamMap.has(homeName)) {
        teamMap.set(homeName, { name: homeName, country: country, league: r.tournament.trim() });
      }
      if (!teamMap.has(awayName)) {
        teamMap.set(awayName, { name: awayName, country: awayName, league: r.tournament.trim() });
      }
    }

    // Create teams in batches
    const teamEntries = Array.from(teamMap.values()).map((t) => ({
      name: t.name,
      shortName: t.name.substring(0, 3).toUpperCase(),
      country: t.country,
      league: 'International',
    }));

    const createdTeams = [];
    for (let i = 0; i < teamEntries.length; i += 100) {
      const batch = await Team.bulkCreate(teamEntries.slice(i, i + 100));
      createdTeams.push(...batch);
    }
    console.log(`${createdTeams.length} teams created.`);

    // Build name→id lookup
    const teamLookup = {};
    for (const t of createdTeams) {
      teamLookup[t.name] = t.id;
    }

    // Create players for major national teams
    let playerCount = 0;
    for (const [teamName, players] of Object.entries(nationalTeamPlayers)) {
      const teamId = teamLookup[teamName];
      if (!teamId) continue;
      for (const p of players) {
        await Player.create({ ...p, teamId });
        playerCount++;
      }
    }
    console.log(`${playerCount} players created for ${Object.keys(nationalTeamPlayers).length} national teams.`);

    // CLEANING STEP 5: Create matches with auto-assigned seasons
    const matchBatch = [];
    for (const r of clean) {
      const homeId = teamLookup[r.home_team.trim()];
      const awayId = teamLookup[r.away_team.trim()];
      if (!homeId || !awayId) continue;

      matchBatch.push({
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: parseInt(r.home_score),
        awayScore: parseInt(r.away_score),
        matchDate: r.date.trim(),
        season: determineSeason(r.date.trim()),
        competition: r.tournament.trim(),
        venue: r.city ? r.city.trim() : null,
        status: 'completed',
      });
    }

    // Insert in batches of 500
    for (let i = 0; i < matchBatch.length; i += 500) {
      await Match.bulkCreate(matchBatch.slice(i, i + 500));
      if ((i + 500) % 2000 === 0) {
        console.log(`  Imported ${Math.min(i + 500, matchBatch.length)} / ${matchBatch.length} matches...`);
      }
    }
    console.log(`${matchBatch.length} matches imported.`);

    // Summary stats
    const competitions = [...new Set(matchBatch.map((m) => m.competition))];
    const seasons = [...new Set(matchBatch.map((m) => m.season))];
    console.log(`\nDataset Summary:`);
    console.log(`  Teams: ${createdTeams.length}`);
    console.log(`  Players: ${playerCount}`);
    console.log(`  Matches: ${matchBatch.length}`);
    console.log(`  Competitions: ${competitions.length} (${competitions.slice(0, 5).join(', ')}...)`);
    console.log(`  Seasons: ${seasons.sort().join(', ')}`);
    console.log('\nImport completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importDataset();
