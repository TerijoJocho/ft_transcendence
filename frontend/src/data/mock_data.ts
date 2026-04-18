export type WeeklyPoint = {
  dayIndex: number;
  date: string;
  winrate: number;
};

export type WeeklyWinrateResponse = {
  timezone: string;
  weekStart: string;
  points: WeeklyPoint[];
};

export type DashboardMatch = {
  gameId: number;
  opponentName: string;
  playerResult: 'WIN' | 'LOSS' | 'DRAW';
  gameMode: string;
  playerColor: 'WHITE' | 'BLACK';
  gameDuration: string;
};

export type DashboardUserStats = {
  id: number;
  pseudo: string;
  status: string;
  elo: number;
  winCount: number;
  lossCount: number;
  drawCount: number;
  totalGames: number;
  winrate: number;
  favColor: string;
  favGameMode: string;
  currentWinStreak: number;
  longestWinStreak: number;
  gameHistoryList: DashboardMatch[];
};

export const mockWeeklyWinrateData: WeeklyWinrateResponse = {
  timezone: 'UTC',
  weekStart: '2026-04-13',
  points: [
    { dayIndex: 1, date: '2026-04-13', winrate: 0 },
    { dayIndex: 2, date: '2026-04-14', winrate: 50 },
    { dayIndex: 3, date: '2026-04-15', winrate: 66.67 },
    { dayIndex: 4, date: '2026-04-16', winrate: 60 },
    { dayIndex: 5, date: '2026-04-17', winrate: 62.5 },
    { dayIndex: 6, date: '2026-04-18', winrate: 66.67 },
    { dayIndex: 7, date: '2026-04-19', winrate: 70 },
  ],
};

export const mockDashboardUserStats: DashboardUserStats = {
  id: 42,
  pseudo: 'terijo',
  status: 'ONLINE',
  elo: 2000,
  winCount: 35,
  lossCount: 12,
  drawCount: 3,
  totalGames: 50,
  winrate: 70,
  favColor: 'WHITE',
  favGameMode: 'CLASSIC',
  currentWinStreak: 4,
  longestWinStreak: 9,
  gameHistoryList: [
    {
      gameId: 1201,
      opponentName: 'NeoKnight',
      playerResult: 'WIN',
      gameMode: 'CLASSIC',
      playerColor: 'WHITE',
      gameDuration: '00:12:35',
    },
    {
      gameId: 1202,
      opponentName: 'PixelPawn',
      playerResult: 'LOSS',
      gameMode: 'BLITZ',
      playerColor: 'BLACK',
      gameDuration: '00:05:41',
    },
    {
      gameId: 1203,
      opponentName: 'RookMaster',
      playerResult: 'WIN',
      gameMode: 'CLASSIC',
      playerColor: 'BLACK',
      gameDuration: '00:18:09',
    },
    {
      gameId: 1204,
      opponentName: 'QueenRush',
      playerResult: 'DRAW',
      gameMode: 'RAPID',
      playerColor: 'WHITE',
      gameDuration: '00:09:58',
    },
    {
      gameId: 1205,
      opponentName: 'BishopFlow',
      playerResult: 'WIN',
      gameMode: 'BLITZ',
      playerColor: 'WHITE',
      gameDuration: '00:06:22',
    },
    {
      gameId: 1206,
      opponentName: 'CastleCore',
      playerResult: 'WIN',
      gameMode: 'CLASSIC',
      playerColor: 'BLACK',
      gameDuration: '00:15:04',
    },
    {
      gameId: 1207,
      opponentName: 'ForkHunter',
      playerResult: 'LOSS',
      gameMode: 'RAPID',
      playerColor: 'BLACK',
      gameDuration: '00:08:17',
    },
    {
      gameId: 1208,
      opponentName: 'TempoWolf',
      playerResult: 'WIN',
      gameMode: 'CLASSIC',
      playerColor: 'WHITE',
      gameDuration: '00:11:49',
    },
    {
      gameId: 1209,
      opponentName: 'EndgameZen',
      playerResult: 'WIN',
      gameMode: 'CLASSIC',
      playerColor: 'WHITE',
      gameDuration: '00:14:53',
    },
    {
      gameId: 1210,
      opponentName: 'GambitFox',
      playerResult: 'WIN',
      gameMode: 'BLITZ',
      playerColor: 'BLACK',
      gameDuration: '00:04:39',
    },
  ],
};

export const mockDashboardData = {
  userStats: mockDashboardUserStats,
  weeklyWinrate: mockWeeklyWinrateData,
};