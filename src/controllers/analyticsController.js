const { Match, Team, Player } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');

// League standings / leaderboard for a given season and competition
const getLeaderboard = async (req, res, next) => {
  try {
    const { season, competition } = req.query;
    if (!season || !competition) {
      return res.status(400).json({ error: 'Both "season" and "competition" query parameters are required.' });
    }

    const matches = await Match.findAll({
      where: { season, competition, status: 'completed' },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'shortName'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'shortName'] },
      ],
    });

    const standings = {};

    for (const match of matches) {
      const homeId = match.homeTeamId;
      const awayId = match.awayTeamId;

      if (!standings[homeId]) {
        standings[homeId] = {
          teamId: homeId,
          teamName: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          played: 0, wins: 0, draws: 0, losses: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        };
      }
      if (!standings[awayId]) {
        standings[awayId] = {
          teamId: awayId,
          teamName: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          played: 0, wins: 0, draws: 0, losses: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        };
      }

      const home = standings[homeId];
      const away = standings[awayId];

      home.played++;
      away.played++;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.wins++;
        home.points += 3;
        away.losses++;
      } else if (match.homeScore < match.awayScore) {
        away.wins++;
        away.points += 3;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
        home.points += 1;
        away.points += 1;
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    }

    const sorted = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Assign rank
    sorted.forEach((entry, index) => { entry.rank = index + 1; });

    res.json({
      season,
      competition,
      totalMatches: matches.length,
      standings: sorted,
    });
  } catch (error) {
    next(error);
  }
};

// Top scorers
const getTopScorers = async (req, res, next) => {
  try {
    const { limit = 10, position, teamId } = req.query;
    const where = {};

    if (position) where.position = position;
    if (teamId) where.teamId = parseInt(teamId);

    const players = await Player.findAll({
      where: { ...where, goals: { [Op.gt]: 0 } },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'shortName'] }],
      order: [['goals', 'DESC'], ['assists', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      topScorers: players.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        name: p.name,
        team: p.team ? p.team.name : null,
        position: p.position,
        goals: p.goals,
        assists: p.assists,
        appearances: p.appearances,
        goalsPerGame: p.appearances > 0 ? parseFloat((p.goals / p.appearances).toFixed(2)) : 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Team performance summary
const getTeamPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season, competition } = req.query;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const where = {
      [Op.or]: [{ homeTeamId: id }, { awayTeamId: id }],
      status: 'completed',
    };
    if (season) where.season = season;
    if (competition) where.competition = competition;

    const matches = await Match.findAll({ where, order: [['matchDate', 'ASC']] });

    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    const form = []; // last 5 results

    for (const m of matches) {
      const isHome = m.homeTeamId === parseInt(id);
      const scored = isHome ? m.homeScore : m.awayScore;
      const conceded = isHome ? m.awayScore : m.homeScore;

      goalsFor += scored;
      goalsAgainst += conceded;

      if (scored > conceded) {
        wins++;
        form.push('W');
      } else if (scored < conceded) {
        losses++;
        form.push('L');
      } else {
        draws++;
        form.push('D');
      }
    }

    const totalMatches = matches.length;
    const winRate = totalMatches > 0 ? parseFloat(((wins / totalMatches) * 100).toFixed(1)) : 0;

    res.json({
      team: { id: team.id, name: team.name },
      filters: { season: season || 'all', competition: competition || 'all' },
      stats: {
        played: totalMatches,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        winRate,
        avgGoalsScored: totalMatches > 0 ? parseFloat((goalsFor / totalMatches).toFixed(2)) : 0,
        avgGoalsConceded: totalMatches > 0 ? parseFloat((goalsAgainst / totalMatches).toFixed(2)) : 0,
        cleanSheets: matches.filter((m) => {
          const isHome = m.homeTeamId === parseInt(id);
          return isHome ? m.awayScore === 0 : m.homeScore === 0;
        }).length,
      },
      recentForm: form.slice(-5),
    });
  } catch (error) {
    next(error);
  }
};

// Head-to-head comparison between two teams
const getHeadToHead = async (req, res, next) => {
  try {
    const { team1Id, team2Id } = req.query;

    if (!team1Id || !team2Id) {
      return res.status(400).json({ error: 'Both "team1Id" and "team2Id" query parameters are required.' });
    }

    const team1 = await Team.findByPk(team1Id);
    const team2 = await Team.findByPk(team2Id);
    if (!team1) return res.status(404).json({ error: `Team with id ${team1Id} not found.` });
    if (!team2) return res.status(404).json({ error: `Team with id ${team2Id} not found.` });

    const matches = await Match.findAll({
      where: {
        status: 'completed',
        [Op.or]: [
          { homeTeamId: team1Id, awayTeamId: team2Id },
          { homeTeamId: team2Id, awayTeamId: team1Id },
        ],
      },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      ],
      order: [['matchDate', 'DESC']],
    });

    let team1Wins = 0, team2Wins = 0, drawCount = 0;
    let team1Goals = 0, team2Goals = 0;

    for (const m of matches) {
      const t1IsHome = m.homeTeamId === parseInt(team1Id);
      const t1Score = t1IsHome ? m.homeScore : m.awayScore;
      const t2Score = t1IsHome ? m.awayScore : m.homeScore;

      team1Goals += t1Score;
      team2Goals += t2Score;

      if (t1Score > t2Score) team1Wins++;
      else if (t2Score > t1Score) team2Wins++;
      else drawCount++;
    }

    res.json({
      team1: { id: team1.id, name: team1.name, wins: team1Wins, goals: team1Goals },
      team2: { id: team2.id, name: team2.name, wins: team2Wins, goals: team2Goals },
      draws: drawCount,
      totalMatches: matches.length,
      matches: matches.slice(0, 10).map((m) => ({
        id: m.id,
        date: m.matchDate,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        score: `${m.homeScore} - ${m.awayScore}`,
        competition: m.competition,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Season summary / trends
const getSeasonSummary = async (req, res, next) => {
  try {
    const { season } = req.params;

    const matches = await Match.findAll({
      where: { season, status: 'completed' },
    });

    if (matches.length === 0) {
      return res.status(404).json({ error: `No completed matches found for season "${season}".` });
    }

    const totalGoals = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
    const homeWins = matches.filter((m) => m.homeScore > m.awayScore).length;
    const awayWins = matches.filter((m) => m.awayScore > m.homeScore).length;
    const drawMatches = matches.filter((m) => m.homeScore === m.awayScore).length;

    const highestScoring = matches.reduce((max, m) =>
      (m.homeScore + m.awayScore > max.homeScore + max.awayScore) ? m : max
    );

    // Goals per month trend
    const monthlyGoals = {};
    for (const m of matches) {
      const month = m.matchDate.substring(0, 7); // YYYY-MM
      if (!monthlyGoals[month]) monthlyGoals[month] = { matches: 0, goals: 0 };
      monthlyGoals[month].matches++;
      monthlyGoals[month].goals += m.homeScore + m.awayScore;
    }

    const goalsTrend = Object.entries(monthlyGoals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        matches: data.matches,
        totalGoals: data.goals,
        avgGoalsPerMatch: parseFloat((data.goals / data.matches).toFixed(2)),
      }));

    res.json({
      season,
      totalMatches: matches.length,
      totalGoals,
      avgGoalsPerMatch: parseFloat((totalGoals / matches.length).toFixed(2)),
      results: { homeWins, awayWins, draws: drawMatches },
      homeWinPercentage: parseFloat(((homeWins / matches.length) * 100).toFixed(1)),
      highestScoringMatch: {
        id: highestScoring.id,
        date: highestScoring.matchDate,
        score: `${highestScoring.homeScore} - ${highestScoring.awayScore}`,
        totalGoals: highestScoring.homeScore + highestScoring.awayScore,
      },
      goalsTrend,
    });
  } catch (error) {
    next(error);
  }
};

// Form trend: rolling results with cumulative points over time
const getFormTrend = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season, competition, last = 20 } = req.query;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const cappedLast = Math.min(parseInt(last) || 20, 50);

    const where = {
      [Op.or]: [{ homeTeamId: id }, { awayTeamId: id }],
      status: 'completed',
    };
    if (season) where.season = season;
    if (competition) where.competition = competition;

    const matches = await Match.findAll({
      where,
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'shortName'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'shortName'] },
      ],
      order: [['matchDate', 'DESC']],
      limit: cappedLast,
    });

    let cumulativePoints = 0;
    const trend = matches.reverse().map((m) => {
      const isHome = m.homeTeamId === parseInt(id);
      const scored = isHome ? m.homeScore : m.awayScore;
      const conceded = isHome ? m.awayScore : m.homeScore;
      let result, pts;

      if (scored > conceded) { result = 'W'; pts = 3; }
      else if (scored === conceded) { result = 'D'; pts = 1; }
      else { result = 'L'; pts = 0; }

      cumulativePoints += pts;
      const opponent = isHome ? m.awayTeam : m.homeTeam;

      return {
        matchId: m.id,
        date: m.matchDate,
        opponent: opponent ? opponent.name : 'Unknown',
        venue: isHome ? 'Home' : 'Away',
        scored,
        conceded,
        result,
        points: pts,
        cumulativePoints,
      };
    });

    // Compute rolling averages
    const totalPts = trend.reduce((s, t) => s + t.points, 0);
    const totalScored = trend.reduce((s, t) => s + t.scored, 0);
    const totalConceded = trend.reduce((s, t) => s + t.conceded, 0);
    const n = trend.length;

    res.json({
      team: { id: team.id, name: team.name },
      matchesAnalysed: n,
      summary: {
        pointsPerGame: n > 0 ? parseFloat((totalPts / n).toFixed(2)) : 0,
        avgScored: n > 0 ? parseFloat((totalScored / n).toFixed(2)) : 0,
        avgConceded: n > 0 ? parseFloat((totalConceded / n).toFixed(2)) : 0,
        formString: trend.map((t) => t.result).join(''),
      },
      trend,
    });
  } catch (error) {
    next(error);
  }
};

// Home/away split: compare a team's home record vs away record
const getHomeAwaySplit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season, competition } = req.query;

    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const baseWhere = { status: 'completed' };
    if (season) baseWhere.season = season;
    if (competition) baseWhere.competition = competition;

    const homeMatches = await Match.findAll({
      where: { ...baseWhere, homeTeamId: parseInt(id) },
    });

    const awayMatches = await Match.findAll({
      where: { ...baseWhere, awayTeamId: parseInt(id) },
    });

    function computeSplit(matches, isHome) {
      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
      for (const m of matches) {
        const scored = isHome ? m.homeScore : m.awayScore;
        const conceded = isHome ? m.awayScore : m.homeScore;
        goalsFor += scored;
        goalsAgainst += conceded;
        if (scored > conceded) wins++;
        else if (scored === conceded) draws++;
        else losses++;
      }
      const played = matches.length;
      return {
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points: wins * 3 + draws,
        winRate: played > 0 ? parseFloat(((wins / played) * 100).toFixed(1)) : 0,
        avgScored: played > 0 ? parseFloat((goalsFor / played).toFixed(2)) : 0,
        avgConceded: played > 0 ? parseFloat((goalsAgainst / played).toFixed(2)) : 0,
        cleanSheets: matches.filter((m) => {
          return isHome ? m.awayScore === 0 : m.homeScore === 0;
        }).length,
      };
    }

    const homeSplit = computeSplit(homeMatches, true);
    const awaySplit = computeSplit(awayMatches, false);
    const totalPlayed = homeSplit.played + awaySplit.played;

    res.json({
      team: { id: team.id, name: team.name },
      filters: { season: season || 'all', competition: competition || 'all' },
      home: homeSplit,
      away: awaySplit,
      comparison: {
        totalPlayed,
        homeWinRate: homeSplit.winRate,
        awayWinRate: awaySplit.winRate,
        homeAdvantage: parseFloat((homeSplit.winRate - awaySplit.winRate).toFixed(1)),
        homeGoalsAvg: homeSplit.avgScored,
        awayGoalsAvg: awaySplit.avgScored,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getTopScorers,
  getTeamPerformance,
  getHeadToHead,
  getSeasonSummary,
  getFormTrend,
  getHomeAwaySplit,
};
