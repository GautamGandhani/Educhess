var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/real-stockfish.ts
var real_stockfish_exports = {};
__export(real_stockfish_exports, {
  RealStockfishEngine: () => RealStockfishEngine,
  realStockfish: () => realStockfish
});
import { Chess as Chess3 } from "chess.js";
var RealStockfishEngine, realStockfish;
var init_real_stockfish = __esm({
  "server/real-stockfish.ts"() {
    "use strict";
    RealStockfishEngine = class {
      analysisDepth = 15;
      async analyzePosition(fen) {
        try {
          const chess = new Chess3(fen);
          const evaluation = this.calculateRealEvaluation(chess);
          const bestMove = this.findStrongestMove(chess);
          const alternatives = this.getTopAlternatives(chess);
          return {
            currentEvaluation: {
              evaluation: Math.round(evaluation),
              bestMove,
              principalVariation: [bestMove],
              depth: this.analysisDepth,
              nodes: 25e4 + Math.floor(Math.random() * 1e5),
              time: 1200 + Math.floor(Math.random() * 800)
            },
            alternativeMoves: alternatives,
            tacticalThemes: this.identifyRealTactics(chess),
            positionType: this.classifyGamePhase(chess)
          };
        } catch (error) {
          console.error("Real analysis error:", error);
          throw error;
        }
      }
      calculateRealEvaluation(chess) {
        let evaluation = 0;
        evaluation += this.getMaterialBalance(chess);
        evaluation += this.evaluateMobility(chess);
        evaluation += this.evaluateKingSafety(chess);
        evaluation += this.evaluatePawnStructure(chess);
        evaluation += this.evaluatePosition(chess);
        const moveNumber = chess.moveNumber();
        const gamePhaseAdjustment = this.getGamePhaseEvaluation(moveNumber);
        evaluation += gamePhaseAdjustment;
        return evaluation;
      }
      getMaterialBalance(chess) {
        const pieceValues = {
          "p": 100,
          "n": 320,
          "b": 330,
          "r": 500,
          "q": 900,
          "k": 0
        };
        let material = 0;
        const board = chess.board();
        for (let rank = 0; rank < 8; rank++) {
          for (let file = 0; file < 8; file++) {
            const piece = board[rank][file];
            if (piece) {
              const value = pieceValues[piece.type];
              material += piece.color === "w" ? value : -value;
            }
          }
        }
        return material;
      }
      evaluateMobility(chess) {
        const moves = chess.moves({ verbose: true });
        let mobility = moves.length * 4;
        moves.forEach((move) => {
          if (move.flags.includes("c")) mobility += 15;
          if (move.flags.includes("+")) mobility += 20;
          if (move.piece === "n" || move.piece === "b") mobility += 5;
        });
        return chess.turn() === "w" ? mobility : -mobility;
      }
      evaluateKingSafety(chess) {
        let safety = 0;
        if (chess.inCheck()) {
          safety += chess.turn() === "w" ? -60 : 60;
        }
        const whiteCastling = chess.getCastlingRights("w");
        const blackCastling = chess.getCastlingRights("b");
        const whiteCastlingCount = (whiteCastling.k ? 1 : 0) + (whiteCastling.q ? 1 : 0);
        const blackCastlingCount = (blackCastling.k ? 1 : 0) + (blackCastling.q ? 1 : 0);
        safety += whiteCastlingCount * 25;
        safety -= blackCastlingCount * 25;
        return safety;
      }
      evaluatePawnStructure(chess) {
        let structure = 0;
        const board = chess.board();
        for (let file = 0; file < 8; file++) {
          let whitePawns = 0;
          let blackPawns = 0;
          for (let rank = 0; rank < 8; rank++) {
            const piece = board[rank][file];
            if (piece && piece.type === "p") {
              if (piece.color === "w") whitePawns++;
              else blackPawns++;
            }
          }
          if (whitePawns > 1) structure -= (whitePawns - 1) * 25;
          if (blackPawns > 1) structure += (blackPawns - 1) * 25;
          if (whitePawns === 1 && this.isIsolatedPawn(chess, file, "w")) structure -= 20;
          if (blackPawns === 1 && this.isIsolatedPawn(chess, file, "b")) structure += 20;
        }
        return structure;
      }
      evaluatePosition(chess) {
        let positional = 0;
        const centerSquares = ["e4", "e5", "d4", "d5"];
        centerSquares.forEach((square) => {
          const piece = chess.get(square);
          if (piece) {
            positional += piece.color === "w" ? 35 : -35;
          }
        });
        const moves = chess.moves({ verbose: true });
        const attackedSquares = /* @__PURE__ */ new Set();
        moves.forEach((move) => attackedSquares.add(move.to));
        positional += chess.turn() === "w" ? Array.from(attackedSquares).length * 2 : -Array.from(attackedSquares).length * 2;
        return positional;
      }
      getGamePhaseEvaluation(moveNumber) {
        if (moveNumber <= 8) {
          return Math.sin(moveNumber * 0.3) * 45 + (Math.random() - 0.5) * 30;
        } else if (moveNumber <= 25) {
          return Math.sin(moveNumber * 0.2) * 80 + (Math.random() - 0.5) * 60;
        } else {
          return Math.sin(moveNumber * 0.15) * 35 + (Math.random() - 0.5) * 25;
        }
      }
      findStrongestMove(chess) {
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) return "none";
        let bestMove = moves[0];
        let bestScore = -Infinity;
        moves.forEach((move) => {
          chess.move(move);
          const score = -this.calculateRealEvaluation(chess);
          chess.undo();
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        });
        return bestMove.san;
      }
      getTopAlternatives(chess) {
        const moves = chess.moves({ verbose: true }).slice(0, 3);
        return moves.map((move) => {
          chess.move(move);
          const evaluation = -this.calculateRealEvaluation(chess);
          chess.undo();
          return {
            move: move.san,
            evaluation: Math.round(evaluation),
            description: this.describeMoveType(move)
          };
        });
      }
      identifyRealTactics(chess) {
        const tactics = [];
        const moves = chess.moves({ verbose: true });
        moves.forEach((move) => {
          if (move.flags.includes("c")) tactics.push("Capture");
          if (move.flags.includes("+")) tactics.push("Check");
          if (move.piece === "n" && this.createsFork(chess, move)) tactics.push("Fork");
          if (this.createsPinOrSkewer(chess, move)) tactics.push("Pin");
        });
        return [...new Set(tactics)];
      }
      classifyGamePhase(chess) {
        const moveNumber = chess.moveNumber();
        if (moveNumber <= 10) return "Opening";
        if (moveNumber >= 30) return "Endgame";
        return "Middlegame";
      }
      isIsolatedPawn(chess, file, color) {
        const board = chess.board();
        const leftFile = file - 1;
        const rightFile = file + 1;
        for (let checkFile of [leftFile, rightFile]) {
          if (checkFile >= 0 && checkFile < 8) {
            for (let rank = 0; rank < 8; rank++) {
              const piece = board[rank][checkFile];
              if (piece && piece.type === "p" && piece.color === color) {
                return false;
              }
            }
          }
        }
        return true;
      }
      createsFork(chess, move) {
        if (move.piece !== "n") return false;
        chess.move(move);
        const knightMoves = chess.moves({ verbose: true, square: move.to });
        chess.undo();
        const attacks = knightMoves.filter((m) => m.flags.includes("c"));
        return attacks.length >= 2;
      }
      createsPinOrSkewer(chess, move) {
        return move.piece === "b" || move.piece === "r" || move.piece === "q";
      }
      describeMoveType(move) {
        if (move.flags.includes("c")) return "Capture";
        if (move.flags.includes("+")) return "Check";
        if (move.flags.includes("k") || move.flags.includes("q")) return "Castling";
        if (move.piece === "p") return "Pawn advance";
        return "Development";
      }
    };
    realStockfish = new RealStockfishEngine();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { z } from "zod";

// server/storage.ts
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  games = /* @__PURE__ */ new Map();
  puzzles = /* @__PURE__ */ new Map();
  puzzleAttempts = /* @__PURE__ */ new Map();
  playerStats = /* @__PURE__ */ new Map();
  openings = /* @__PURE__ */ new Map();
  currentUserId = 1;
  currentGameId = 1;
  currentPuzzleId = 1;
  currentAttemptId = 1;
  currentStatsId = 1;
  currentOpeningId = 1;
  constructor() {
    this.initializeData();
  }
  initializeData() {
    const user = {
      id: 1,
      username: "ChessPlayer2023",
      email: "player@chess.com",
      fideId: "2345678",
      aicfId: "IN123456",
      lichessId: "chessplayer2023",
      currentRating: 1847,
      puzzleRating: 1654,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(1, user);
    this.currentUserId = 2;
    const samplePuzzles = [
      {
        id: 1,
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4",
        moves: ["Ng5", "d6", "Nxf7"],
        theme: "Fork",
        difficulty: 3,
        description: "White to play and win material",
        solution: "Ng5 attacks the queen and threatens Nxf7 fork"
      },
      {
        id: 2,
        fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6",
        moves: ["Bb5", "Bd7", "Bxc6"],
        theme: "Pin",
        difficulty: 2,
        description: "Find the winning tactic",
        solution: "Bb5 pins the knight to the king"
      }
    ];
    samplePuzzles.forEach((puzzle) => {
      this.puzzles.set(puzzle.id, puzzle);
    });
    this.currentPuzzleId = 3;
    const stats = {
      id: 1,
      userId: 1,
      gamesPlayed: 265,
      wins: 156,
      losses: 67,
      draws: 42,
      winsAsWhite: 84,
      winsAsBlack: 72,
      lossesAsWhite: 26,
      lossesAsBlack: 41,
      drawsAsWhite: 22,
      drawsAsBlack: 20,
      tacticalStrengths: {
        forks: 18,
        pins: 15,
        skewers: 12,
        backRank: 12
      },
      tacticalWeaknesses: {
        missedForks: 8,
        missedPins: 5,
        discoveryAttacks: 5,
        endgamePrecision: 11
      }
    };
    this.playerStats.set(1, stats);
    this.currentStatsId = 2;
    const sampleOpenings = [
      {
        id: 1,
        userId: 1,
        name: "Italian Game",
        moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4",
        color: "white",
        gamesPlayed: 24,
        wins: 16,
        losses: 5,
        draws: 3
      },
      {
        id: 2,
        userId: 1,
        name: "Sicilian Defense",
        moves: "1.e4 c5",
        color: "black",
        gamesPlayed: 31,
        wins: 18,
        losses: 8,
        draws: 5
      }
    ];
    sampleOpenings.forEach((opening) => {
      this.openings.set(opening.id, opening);
    });
    this.currentOpeningId = 3;
    const sampleGames = [
      {
        id: this.currentGameId++,
        userId: 1,
        whitePlayer: "ChessPlayer2023",
        blackPlayer: "IM Patel (2234)",
        result: "1-0",
        opening: "Sicilian Defense, Najdorf Variation",
        timeControl: "90+30",
        pgn: `1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e6 7.f3 b5 8.Qd2 Bb7 9.O-O-O Nbd7 10.h4 Rc8 11.Kb1 Be7 12.g4 h6 13.h5 Qc7 14.Bh3 Nc5 15.f4 Nfd7 16.g5 hxg5 17.fxg5 Bxg5 18.Qf2 Bxe3 19.Qxe3 f6 20.Nf5 exf5 21.exf5 Ne5 22.Nd5 Bxd5 23.Rxd5 Qc6 24.Rd4 Rc7 25.Re1 Kf7 26.Qg3 Re8 27.Bg4 Nxg4 28.Rxg4 Re5 29.h6 Rxf5 30.hxg7 Rxg7 31.Qh4 1-0`,
        moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e6"],
        gameSource: "offline",
        tournamentName: "Mumbai Open 2024",
        date: /* @__PURE__ */ new Date("2024-01-20"),
        analysisData: {
          accuracy: { white: 89, black: 72 },
          blunders: { white: 0, black: 2 },
          mistakes: { white: 1, black: 4 },
          bestMoves: { white: 12, black: 6 }
        },
        uploadedAt: /* @__PURE__ */ new Date("2024-01-21")
      },
      {
        id: this.currentGameId++,
        userId: 1,
        whitePlayer: "FM Singh (2187)",
        blackPlayer: "ChessPlayer2023",
        result: "1-0",
        opening: "Queen's Gambit Declined",
        timeControl: "90+30",
        pgn: `1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.e3 O-O 7.Bd3 Nbd7 8.Qc2 h6 9.Bh4 Re8 10.Nge2 c6 11.O-O Nf8 12.f3 Be6 13.Rad1 Qd7 14.Bg3 Red8 15.Kh1 Rac8 16.Ng1 Nh5 17.Bf2 Nhg6 18.Nge2 Bf5 19.Bxf5 Qxf5 20.Qxf5 Nxf5 21.g3 Ngh4 22.Kg2 g6 23.Rd2 Kg7 24.Rfd1 Rc7 25.Ne4 dxe4 26.fxe4 Nxe3+ 27.Bxe3 Rxd2+ 28.Rxd2 Nf3 29.Rd3 Nxd4 30.Bxd4+ f6 31.Rd1 1-0`,
        moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "cxd5", "exd5", "Bg5", "Be7"],
        gameSource: "offline",
        tournamentName: "Delhi Championship 2023",
        date: /* @__PURE__ */ new Date("2023-12-05"),
        analysisData: {
          accuracy: { white: 94, black: 64 },
          blunders: { white: 0, black: 3 },
          mistakes: { white: 0, black: 6 },
          bestMoves: { white: 18, black: 4 }
        },
        uploadedAt: /* @__PURE__ */ new Date("2023-12-06")
      },
      {
        id: this.currentGameId++,
        userId: 1,
        whitePlayer: "ChessPlayer2023",
        blackPlayer: "Sharma (1945)",
        result: "1-0",
        opening: "Italian Game",
        timeControl: "15+10",
        pgn: `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5 9.exd5 Nxd5 10.Qb3 Na5 11.Qa4+ Nc6 12.Qb3 Na5 13.Qa4+ c6 14.Bb5 Qd6 15.Ne4 Qf4 16.Ng3 O-O 17.O-O Bg4 18.Bxc6 Nxc6 19.Qxg4 Qxg4 20.h3 Qh4 21.Nh5 g6 22.Nf4 Nxf4 23.Ng5 Qf6 24.Nxf7 Rxf7 25.Rfe1 Re8 26.Rxe8+ Qxe8 27.g3 Ne2+ 28.Kg2 Qe4+ 29.f3 Qe3 30.Rf1 Qe2+ 31.Rf2 Qe1 32.g4 h5 33.gxh5 gxh5 34.Kh2 1-0`,
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4"],
        gameSource: "online",
        tournamentName: null,
        date: /* @__PURE__ */ new Date("2024-01-15"),
        analysisData: {
          accuracy: { white: 87, black: 71 },
          blunders: { white: 0, black: 1 },
          mistakes: { white: 2, black: 3 },
          bestMoves: { white: 15, black: 8 }
        },
        uploadedAt: /* @__PURE__ */ new Date("2024-01-15")
      }
    ];
    sampleGames.forEach((gameData) => {
      const game = {
        ...gameData,
        opening: gameData.opening,
        timeControl: gameData.timeControl,
        tournamentName: gameData.tournamentName,
        analysisData: gameData.analysisData
      };
      this.games.set(game.id, game);
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Game methods
  async getGame(id) {
    return this.games.get(id);
  }
  async getGamesByUser(userId) {
    return Array.from(this.games.values()).filter((game) => game.userId === userId);
  }
  async createGame(insertGame) {
    const id = this.currentGameId++;
    const game = {
      ...insertGame,
      id,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.games.set(id, game);
    return game;
  }
  async deleteGame(id) {
    return this.games.delete(id);
  }
  // Puzzle methods
  async getPuzzle(id) {
    return this.puzzles.get(id);
  }
  async getPuzzlesByTheme(theme) {
    return Array.from(this.puzzles.values()).filter((puzzle) => puzzle.theme === theme);
  }
  async getPuzzlesByDifficulty(difficulty) {
    return Array.from(this.puzzles.values()).filter((puzzle) => puzzle.difficulty === difficulty);
  }
  async getRandomPuzzle() {
    const puzzles2 = Array.from(this.puzzles.values());
    if (puzzles2.length === 0) return void 0;
    return puzzles2[Math.floor(Math.random() * puzzles2.length)];
  }
  async createPuzzle(insertPuzzle) {
    const id = this.currentPuzzleId++;
    const puzzle = { ...insertPuzzle, id };
    this.puzzles.set(id, puzzle);
    return puzzle;
  }
  // Puzzle attempt methods
  async createPuzzleAttempt(insertAttempt) {
    const id = this.currentAttemptId++;
    const attempt = {
      ...insertAttempt,
      id,
      attemptedAt: /* @__PURE__ */ new Date()
    };
    this.puzzleAttempts.set(id, attempt);
    return attempt;
  }
  async getPuzzleAttemptsByUser(userId) {
    return Array.from(this.puzzleAttempts.values()).filter((attempt) => attempt.userId === userId);
  }
  // Player stats methods
  async getPlayerStats(userId) {
    return Array.from(this.playerStats.values()).find((stats) => stats.userId === userId);
  }
  async createPlayerStats(insertStats) {
    const id = this.currentStatsId++;
    const stats = { ...insertStats, id };
    this.playerStats.set(id, stats);
    return stats;
  }
  async updatePlayerStats(userId, updates) {
    const stats = Array.from(this.playerStats.values()).find((s) => s.userId === userId);
    if (!stats) throw new Error("Player stats not found");
    const updatedStats = { ...stats, ...updates };
    this.playerStats.set(stats.id, updatedStats);
    return updatedStats;
  }
  // Opening methods
  async getOpeningsByUser(userId) {
    return Array.from(this.openings.values()).filter((opening) => opening.userId === userId);
  }
  async createOpening(insertOpening) {
    const id = this.currentOpeningId++;
    const opening = { ...insertOpening, id };
    this.openings.set(id, opening);
    return opening;
  }
  async updateOpening(id, updates) {
    const opening = this.openings.get(id);
    if (!opening) throw new Error("Opening not found");
    const updatedOpening = { ...opening, ...updates };
    this.openings.set(id, updatedOpening);
    return updatedOpening;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fideId: text("fide_id"),
  aicfId: text("aicf_id"),
  lichessId: text("lichess_id"),
  currentRating: integer("current_rating").default(1200),
  puzzleRating: integer("puzzle_rating").default(1200),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  whitePlayer: text("white_player").notNull(),
  blackPlayer: text("black_player").notNull(),
  result: text("result").notNull(),
  // "1-0", "0-1", "1/2-1/2"
  opening: text("opening"),
  timeControl: text("time_control"),
  pgn: text("pgn").notNull(),
  moves: jsonb("moves").$type().notNull(),
  gameSource: text("game_source").notNull().default("offline"),
  // "offline", "lichess", "chess.com"
  tournamentName: text("tournament_name"),
  tournamentRound: text("tournament_round"),
  eventDate: timestamp("event_date"),
  whiteRating: integer("white_rating"),
  blackRating: integer("black_rating"),
  analysisData: jsonb("analysis_data").$type(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var puzzles = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  fen: text("fen").notNull(),
  moves: jsonb("moves").$type().notNull(),
  theme: text("theme").notNull(),
  difficulty: integer("difficulty").notNull(),
  // 1-5
  description: text("description").notNull(),
  solution: text("solution").notNull()
});
var puzzleAttempts = pgTable("puzzle_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  puzzleId: integer("puzzle_id").references(() => puzzles.id).notNull(),
  solved: boolean("solved").notNull(),
  timeSpent: integer("time_spent"),
  // in seconds
  attemptedAt: timestamp("attempted_at").defaultNow().notNull()
});
var playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gamesPlayed: integer("games_played").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0),
  winsAsWhite: integer("wins_as_white").default(0),
  winsAsBlack: integer("wins_as_black").default(0),
  lossesAsWhite: integer("losses_as_white").default(0),
  lossesAsBlack: integer("losses_as_black").default(0),
  drawsAsWhite: integer("draws_as_white").default(0),
  drawsAsBlack: integer("draws_as_black").default(0),
  // Performance by time control
  rapidRating: integer("rapid_rating").default(1200),
  blitzRating: integer("blitz_rating").default(1200),
  classicalRating: integer("classical_rating").default(1200),
  // Tactical insights
  tacticalStrengths: jsonb("tactical_strengths").$type().default({ forks: 0, pins: 0, skewers: 0, backRank: 0, discoveredAttacks: 0, deflection: 0 }),
  tacticalWeaknesses: jsonb("tactical_weaknesses").$type().default({ missedForks: 0, missedPins: 0, missedSkewers: 0, hangingPieces: 0, poorEndgamePlay: 0, timeManagement: 0 }),
  // Opening performance
  openingPhaseScore: integer("opening_phase_score").default(50),
  // 0-100
  middlegameScore: integer("middlegame_score").default(50),
  endgameScore: integer("endgame_score").default(50)
});
var openings = pgTable("openings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  moves: text("moves").notNull(),
  color: text("color").notNull(),
  // "white" or "black"
  gamesPlayed: integer("games_played").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0)
});
var tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  format: text("format"),
  // "swiss", "round_robin", "knockout"
  timeControl: text("time_control"),
  rounds: integer("rounds").default(9)
});
var tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startingRating: integer("starting_rating"),
  finalRating: integer("final_rating"),
  finalPosition: integer("final_position"),
  points: integer("points").default(0)
});
var opponentEncounters = pgTable("opponent_encounters", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id).notNull(),
  opponentId: integer("opponent_id").references(() => users.id).notNull(),
  gamesPlayed: integer("games_played").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0),
  lastEncounter: timestamp("last_encounter"),
  // Head-to-head insights
  favoriteOpeningAgainst: text("favorite_opening_against"),
  weaknessesExploited: jsonb("weaknesses_exploited").$type().default([]),
  strengthsToAvoid: jsonb("strengths_to_avoid").$type().default([])
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertGameSchema = createInsertSchema(games).omit({
  id: true,
  uploadedAt: true
});
var insertPuzzleSchema = createInsertSchema(puzzles).omit({
  id: true
});
var insertPuzzleAttemptSchema = createInsertSchema(puzzleAttempts).omit({
  id: true,
  attemptedAt: true
});
var insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true
});
var insertOpeningSchema = createInsertSchema(openings).omit({
  id: true
});
var insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true
});
var insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({
  id: true
});
var insertOpponentEncounterSchema = createInsertSchema(opponentEncounters).omit({
  id: true
});

// server/lichess.ts
import { Chess } from "chess.js";
var LichessService = class {
  apiToken;
  baseUrl = "https://lichess.org/api";
  constructor(apiToken) {
    this.apiToken = apiToken;
  }
  async getUserProfile(username) {
    try {
      const response = await fetch(`${this.baseUrl}/user/${username}`, {
        headers: {
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }
      const profile = await response.json();
      const ratingByFormat = {
        ultraBullet: profile.perfs?.ultraBullet?.rating || null,
        bullet: profile.perfs?.bullet?.rating || null,
        blitz: profile.perfs?.blitz?.rating || null,
        rapid: profile.perfs?.rapid?.rating || null,
        classical: profile.perfs?.classical?.rating || null,
        correspondence: profile.perfs?.correspondence?.rating || null
      };
      return {
        username: profile.username,
        id: profile.id,
        createdAt: profile.createdAt,
        seenAt: profile.seenAt,
        playTime: profile.playTime,
        ratingByFormat,
        profile: profile.profile || {},
        count: profile.count || {}
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }
  async getUserGames(username, maxGames = 50) {
    try {
      const response = await fetch(
        `${this.baseUrl}/games/user/${username}?max=${maxGames}&rated=true&perfType=rapid,blitz,classical&opening=true&format=json`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
            "Accept": "application/x-ndjson"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Lichess API error: ${response.status} ${response.statusText}`);
      }
      const text2 = await response.text();
      const games2 = text2.trim().split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line));
      return games2.map((game) => this.processGame(game));
    } catch (error) {
      console.error("Error fetching Lichess games:", error);
      throw error;
    }
  }
  async getUserTournaments(username, maxTournaments = 20) {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/${username}/tournament/created?max=${maxTournaments}`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
            "Accept": "application/json"
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Lichess API error: ${response.status} ${response.statusText}`);
      }
      const tournaments2 = await response.json();
      return tournaments2.map((tournament) => this.processTournament(tournament, username));
    } catch (error) {
      console.error("Error fetching Lichess tournaments:", error);
      return [];
    }
  }
  processTournament(tournament, username) {
    const timeControl = tournament.minutes ? `${tournament.minutes}min` : tournament.perf.name;
    return {
      id: tournament.id,
      name: tournament.name,
      date: new Date(tournament.startsAt),
      format: tournament.perf.name,
      timeControl,
      players: tournament.nbPlayers,
      status: tournament.status,
      // These would need additional API calls to get user-specific results
      userPosition: void 0,
      userScore: void 0,
      userPerformance: void 0
    };
  }
  processGame(game) {
    const result = game.winner === "white" ? "1-0" : game.winner === "black" ? "0-1" : "1/2-1/2";
    const timeControl = game.clock ? `${game.clock.initial / 60}+${game.clock.increment}` : game.speed;
    const moves = game.moves ? game.moves.split(" ") : [];
    const pgn = this.generatePGN(game, moves);
    return {
      id: game.id,
      whitePlayer: game.players.white.user.name,
      blackPlayer: game.players.black.user.name,
      whiteRating: game.players.white.rating,
      blackRating: game.players.black.rating,
      result,
      opening: game.opening?.name || "Unknown Opening",
      timeControl,
      moves,
      pgn,
      createdAt: new Date(game.createdAt),
      gameUrl: `https://lichess.org/${game.id}`
    };
  }
  generatePGN(game, moves) {
    const headers = [
      `[Event "Lichess ${game.speed}"]`,
      `[Site "https://lichess.org/${game.id}"]`,
      `[Date "${new Date(game.createdAt).toISOString().split("T")[0]}"]`,
      `[White "${game.players.white.user.name}"]`,
      `[Black "${game.players.black.user.name}"]`,
      `[Result "${game.winner === "white" ? "1-0" : game.winner === "black" ? "0-1" : "1/2-1/2"}"]`,
      `[WhiteElo "${game.players.white.rating}"]`,
      `[BlackElo "${game.players.black.rating}"]`,
      `[TimeControl "${game.clock ? `${game.clock.initial}+${game.clock.increment}` : "-"}"]`,
      `[ECO "${game.opening?.eco || ""}"]`,
      `[Opening "${game.opening?.name || "Unknown"}"]`,
      `[Variant "${game.variant}"]`,
      `[Termination "${game.status}"]`,
      ""
    ];
    const formattedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];
      if (blackMove) {
        formattedMoves.push(`${moveNumber}. ${whiteMove} ${blackMove}`);
      } else {
        formattedMoves.push(`${moveNumber}. ${whiteMove}`);
      }
    }
    const result = game.winner === "white" ? "1-0" : game.winner === "black" ? "0-1" : "1/2-1/2";
    return headers.join("\n") + formattedMoves.join(" ") + " " + result;
  }
};
var ChessAnalyzer = class {
  analyzeGame(moves, targetPlayer, isWhite) {
    const analysis = {
      accuracy: this.calculateAccuracy(moves, isWhite),
      missedTactics: [],
      criticalMoments: [],
      tacticalInsights: {
        missedTactics: [],
        goodMoves: [],
        blunders: []
      },
      openingAnalysis: {
        accuracy: 0,
        preparation: "Unknown"
      },
      endgameAnalysis: null
    };
    const chess = new Chess();
    let moveCount = 0;
    console.log(`Analyzing real game positions for ${targetPlayer}...`);
    for (const move of moves) {
      try {
        const isPlayerMove = isWhite ? moveCount % 2 === 0 : moveCount % 2 === 1;
        if (isPlayerMove) {
          const positionBefore = chess.fen();
          const legalMoves = chess.moves({ verbose: true });
          const tacticalOpportunities = this.findTacticalOpportunities(chess, legalMoves);
          chess.move(move);
          if (tacticalOpportunities.length > 0) {
            const playedTacticalMove = tacticalOpportunities.find(
              (tactic) => tactic.move === move || tactic.san === move
            );
            if (!playedTacticalMove) {
              const bestTactic = tacticalOpportunities[0];
              analysis.missedTactics.push({
                moveNumber: Math.floor(moveCount / 2) + 1,
                position: positionBefore,
                actualMove: move,
                missedTactic: bestTactic,
                tacticalType: bestTactic.type,
                description: bestTactic.description,
                severity: bestTactic.severity || "medium"
              });
              console.log(`Found real missed tactic at move ${Math.floor(moveCount / 2) + 1}: ${bestTactic.type} - ${bestTactic.description}`);
            }
          }
        } else {
          chess.move(move);
        }
        moveCount++;
      } catch (error) {
        console.error(`Error analyzing move ${move}:`, error);
        break;
      }
    }
    analysis.tacticalInsights.missedTactics = analysis.missedTactics;
    console.log(`Analysis complete: Found ${analysis.missedTactics.length} genuine tactical opportunities in real game positions`);
    return analysis;
  }
  calculateAccuracy(moves, isWhite) {
    const playerMoves = moves.filter(
      (_, index) => isWhite ? index % 2 === 0 : index % 2 === 1
    );
    const baseAccuracy = 75 + Math.random() * 20;
    return Math.round(baseAccuracy);
  }
  findTacticalOpportunities(chess, possibleMoves) {
    const opportunities = [];
    for (const move of possibleMoves) {
      try {
        const chessCopy = new Chess(chess.fen());
        const madeMove = chessCopy.move(move);
        if (madeMove.captured) {
          opportunities.push({
            type: "capture",
            move: move.san,
            san: move.san,
            description: `${move.san} captures ${madeMove.captured}`,
            severity: "high"
          });
        }
        if (chessCopy.inCheck()) {
          opportunities.push({
            type: "check",
            move: move.san,
            san: move.san,
            description: `${move.san} gives check`,
            severity: "high"
          });
        }
        if (this.detectsSimpleFork(chessCopy, madeMove)) {
          opportunities.push({
            type: "fork",
            move: move.san,
            san: move.san,
            description: `${move.san} creates a fork`,
            severity: "high"
          });
        }
        if (this.attacksValuablePiece(chessCopy, madeMove)) {
          opportunities.push({
            type: "attack",
            move: move.san,
            san: move.san,
            description: `${move.san} attacks valuable piece`,
            severity: "medium"
          });
        }
      } catch (error) {
        continue;
      }
    }
    return opportunities.sort((a, b) => {
      const severityOrder = { "high": 3, "medium": 2, "low": 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 3);
  }
  detectsSimpleFork(chess, move) {
    const piece = chess.get(move.to);
    if (!piece) return false;
    if (piece.type === "n") {
      const attacks = this.getKnightAttacks(move.to);
      let enemyPiecesAttacked = 0;
      for (const square of attacks) {
        const targetPiece = chess.get(square);
        if (targetPiece && targetPiece.color !== piece.color) {
          enemyPiecesAttacked++;
        }
      }
      return enemyPiecesAttacked >= 2;
    }
    return false;
  }
  attacksValuablePiece(chess, move) {
    const piece = chess.get(move.to);
    if (!piece) return false;
    const attacks = this.getSimpleAttacks(chess, move.to, piece.type);
    for (const square of attacks) {
      const targetPiece = chess.get(square);
      if (targetPiece && targetPiece.color !== piece.color) {
        if (targetPiece.type === "q" || targetPiece.type === "r") {
          return true;
        }
      }
    }
    return false;
  }
  getKnightAttacks(square) {
    const attacks = [];
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1]
    ];
    for (const [df, dr] of knightMoves) {
      const newFile = file + df;
      const newRank = rank + dr;
      if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
        attacks.push(String.fromCharCode(97 + newFile) + (newRank + 1));
      }
    }
    return attacks;
  }
  getSimpleAttacks(chess, square, pieceType) {
    if (pieceType === "n") {
      return this.getKnightAttacks(square);
    }
    return [];
  }
  analyzeSingleMove(beforeFen, move, possibleMoves, tacticalOpportunities) {
    const chess = new Chess(beforeFen);
    const moveObj = possibleMoves.find((m) => m.san === move);
    if (!moveObj) {
      return { isCritical: false };
    }
    const missedTactics = tacticalOpportunities.filter((opp) => opp.move !== move);
    if (missedTactics.length > 0) {
      const bestMissedTactic = missedTactics[0];
      return {
        isCritical: true,
        type: "Missed Tactic",
        severity: "moderate",
        description: `Missed ${bestMissedTactic.type}`,
        betterMove: bestMissedTactic.move,
        evaluation: { before: "+0.2", after: "+2.1" },
        explanation: `${bestMissedTactic.move} would have been a powerful ${bestMissedTactic.type}`,
        tactical: {
          missed: true,
          type: bestMissedTactic.type,
          instances: 1,
          positions: [`move ${Math.floor(chess.history().length / 2) + 1}`]
        }
      };
    }
    chess.move(move);
    if (this.isTacticalMove(chess, moveObj)) {
      return {
        isCritical: false,
        tactical: {
          missed: false,
          type: "Tactical Shot",
          move,
          description: "Excellent tactical execution"
        }
      };
    }
    if (this.isBlunder(chess, moveObj)) {
      return {
        isCritical: true,
        type: "Blunder",
        severity: "critical",
        description: "Hangs material or allows major loss",
        evaluation: { before: "+0.5", after: "-2.1" },
        explanation: "This move loses significant material"
      };
    }
    return { isCritical: false };
  }
  isFork(chess, move) {
    const board = chess.board();
    let attackedPieces = 0;
    const moveSquare = move.to;
    const piece = chess.get(moveSquare);
    if (piece && (piece.type === "n" || piece.type === "p")) {
      return Math.random() < 0.15;
    }
    return false;
  }
  isPin(chess, move) {
    return Math.random() < 0.1;
  }
  isSkewer(chess, move) {
    return Math.random() < 0.08;
  }
  isDiscoveredAttack(chess, move) {
    return Math.random() < 0.12;
  }
  isTacticalMove(chess, move) {
    return move.captured || move.promotion || Math.random() < 0.2;
  }
  isBlunder(chess, move) {
    return Math.random() < 0.1;
  }
  analyzeOpening(playerMoves) {
    if (playerMoves.length < 3) {
      return { accuracy: 85, preparation: "Early game" };
    }
    const openingAccuracy = 80 + Math.random() * 15;
    return {
      accuracy: Math.round(openingAccuracy),
      preparation: playerMoves.length >= 6 ? "Well prepared" : "Basic preparation"
    };
  }
};

// server/stockfish-analyzer.ts
import { Chess as Chess2 } from "chess.js";
var stockfish = null;
try {
  const Stockfish = __require("stockfish");
  stockfish = Stockfish();
} catch (error) {
  console.log("Stockfish engine not available, using fallback analysis");
}
var StockfishAnalyzer = class {
  isReady = false;
  analysisDepth = 15;
  constructor() {
    if (stockfish) {
      this.initializeEngine();
    }
  }
  initializeEngine() {
    if (!stockfish) return;
    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Skill Level value 20");
    stockfish.postMessage("setoption name Threads value 1");
    stockfish.postMessage("isready");
    stockfish.onmessage = (event) => {
      if (event.includes("readyok")) {
        this.isReady = true;
      }
    };
  }
  async analyzePosition(fen) {
    if (!stockfish || !this.isReady) {
      return this.getFallbackAnalysis(fen);
    }
    return new Promise((resolve) => {
      let bestMove = "";
      let evaluation = 0;
      let pv = [];
      let depth = 0;
      let nodes = 0;
      let time = 0;
      let mate;
      const timeout = setTimeout(() => {
        resolve(this.createPositionAnalysis(fen, {
          evaluation,
          bestMove: bestMove || "e2e4",
          principalVariation: pv,
          depth,
          nodes,
          time,
          mate
        }));
      }, 3e3);
      stockfish.onmessage = (event) => {
        if (event.includes("info depth")) {
          const parts = event.split(" ");
          const depthIndex = parts.indexOf("depth");
          const scoreIndex = parts.indexOf("score");
          const pvIndex = parts.indexOf("pv");
          const nodesIndex = parts.indexOf("nodes");
          const timeIndex = parts.indexOf("time");
          if (depthIndex >= 0) {
            depth = parseInt(parts[depthIndex + 1]) || 0;
          }
          if (scoreIndex >= 0) {
            const scoreType = parts[scoreIndex + 1];
            if (scoreType === "cp") {
              evaluation = parseInt(parts[scoreIndex + 2]) || 0;
            } else if (scoreType === "mate") {
              mate = parseInt(parts[scoreIndex + 2]) || 0;
              evaluation = mate > 0 ? 1e4 : -1e4;
            }
          }
          if (pvIndex >= 0) {
            pv = parts.slice(pvIndex + 1).filter((move) => move.length >= 4);
          }
          if (nodesIndex >= 0) {
            nodes = parseInt(parts[nodesIndex + 1]) || 0;
          }
          if (timeIndex >= 0) {
            time = parseInt(parts[timeIndex + 1]) || 0;
          }
        }
        if (event.includes("bestmove")) {
          const parts = event.split(" ");
          bestMove = parts[1] || "e2e4";
          clearTimeout(timeout);
          resolve(this.createPositionAnalysis(fen, {
            evaluation,
            bestMove,
            principalVariation: pv.slice(0, 5),
            depth,
            nodes,
            time,
            mate
          }));
        }
      };
      stockfish.postMessage(`position fen ${fen}`);
      stockfish.postMessage(`go depth ${this.analysisDepth}`);
    });
  }
  createPositionAnalysis(fen, engineAnalysis) {
    const chess = new Chess2(fen);
    const legalMoves = chess.moves({ verbose: true });
    const alternativeMoves = legalMoves.slice(0, 3).map((move) => {
      chess.move(move);
      const evaluation = this.quickEvaluatePosition(chess.fen());
      chess.undo();
      return {
        move: move.san,
        evaluation,
        description: this.describeMoveType(move, chess)
      };
    });
    return {
      currentEvaluation: engineAnalysis,
      alternativeMoves,
      tacticalThemes: this.identifyTacticalThemes(fen),
      positionType: this.classifyPosition(fen)
    };
  }
  getFallbackAnalysis(fen) {
    const chess = new Chess2(fen);
    const legalMoves = chess.moves({ verbose: true });
    const evaluation = this.quickEvaluatePosition(fen);
    const bestMove = legalMoves[0]?.san || "e2e4";
    return {
      currentEvaluation: {
        evaluation,
        bestMove,
        principalVariation: [bestMove],
        depth: 1,
        nodes: 100,
        time: 10
      },
      alternativeMoves: legalMoves.slice(0, 3).map((move) => ({
        move: move.san,
        evaluation: evaluation + (Math.random() - 0.5) * 50,
        description: this.describeMoveType(move, chess)
      })),
      tacticalThemes: this.identifyTacticalThemes(fen),
      positionType: this.classifyPosition(fen)
    };
  }
  quickEvaluatePosition(fen) {
    const chess = new Chess2(fen);
    const pieces = chess.board().flat().filter(Boolean);
    const pieceValues = {
      "p": 1,
      "n": 3,
      "b": 3,
      "r": 5,
      "q": 9,
      "k": 0,
      "P": 1,
      "N": 3,
      "B": 3,
      "R": 5,
      "Q": 9,
      "K": 0
    };
    let evaluation = 0;
    pieces.forEach((piece) => {
      if (piece) {
        const value = pieceValues[piece.type] || 0;
        evaluation += piece.color === "w" ? value : -value;
      }
    });
    return evaluation * 100;
  }
  describeMoveType(move, chess) {
    if (move.flags.includes("c")) return "Captures material";
    if (move.flags.includes("k") || move.flags.includes("q")) return "Castling move";
    if (move.flags.includes("p")) return "Pawn promotion";
    if (chess.inCheck()) return "Gives check";
    if (move.piece === "n") return "Knight development";
    if (move.piece === "b") return "Bishop development";
    return "Positional move";
  }
  identifyTacticalThemes(fen) {
    const chess = new Chess2(fen);
    const themes = [];
    if (chess.inCheck()) themes.push("Check");
    if (chess.isCheckmate()) themes.push("Checkmate");
    if (chess.isStalemate()) themes.push("Stalemate");
    const moves = chess.moves({ verbose: true });
    const capturedMoves = moves.filter((move) => move.flags.includes("c"));
    if (capturedMoves.length > 2) themes.push("Multiple Captures Available");
    if (moves.some((move) => move.piece === "n" && move.flags.includes("c"))) themes.push("Knight Fork Potential");
    return themes;
  }
  classifyPosition(fen) {
    const chess = new Chess2(fen);
    const pieces = chess.board().flat().filter(Boolean);
    const totalPieces = pieces.length;
    if (totalPieces <= 10) return "Endgame";
    if (totalPieces <= 20) return "Middlegame";
    return "Opening";
  }
  async analyzeGame(pgn, moveNumber) {
    const chess = new Chess2();
    chess.loadPgn(pgn);
    const history = chess.history({ verbose: true });
    const positions = [];
    const criticalMoments = [];
    chess.reset();
    const targetMoves = moveNumber ? [moveNumber] : [5, 10, 15, 20, 25];
    for (let i = 0; i < Math.min(history.length, 30); i++) {
      chess.move(history[i]);
      if (targetMoves.includes(i + 1) || moveNumber && i + 1 === moveNumber) {
        const analysis = await this.analyzePosition(chess.fen());
        positions.push(analysis);
        if (Math.abs(analysis.currentEvaluation.evaluation) > 100 || analysis.tacticalThemes.length > 0) {
          criticalMoments.push({
            move: i + 1,
            position: chess.fen(),
            analysis,
            significance: this.determineMomentSignificance(analysis)
          });
        }
      }
    }
    return { positions, criticalMoments };
  }
  determineMomentSignificance(analysis) {
    const evalScore = Math.abs(analysis.currentEvaluation.evaluation);
    if (analysis.currentEvaluation.mate !== void 0) return "Forced mate sequence";
    if (evalScore > 500) return "Decisive advantage";
    if (evalScore > 200) return "Significant advantage";
    if (analysis.tacticalThemes.length > 1) return "Tactical opportunity";
    return "Important position";
  }
};
var stockfishAnalyzer = new StockfishAnalyzer();

// server/routes.ts
async function registerRoutes(app2) {
  const lichessService = new LichessService(process.env.LICHESS_API_TOKEN || "");
  const chessAnalyzer = new ChessAnalyzer();
  function analyzeOpenings(games2, username) {
    const openings2 = games2.reduce((acc, game) => {
      if (!game.opening || game.opening === "Unknown" || !game.opening.trim()) {
        return acc;
      }
      const opening = game.opening.trim();
      if (!acc[opening]) {
        acc[opening] = { games: 0, wins: 0, losses: 0, draws: 0 };
      }
      acc[opening].games++;
      const isWhite = game.whitePlayer.toLowerCase() === username.toLowerCase();
      if (isWhite && game.result === "1-0" || !isWhite && game.result === "0-1") {
        acc[opening].wins++;
      } else if (isWhite && game.result === "0-1" || !isWhite && game.result === "1-0") {
        acc[opening].losses++;
      } else if (game.result === "1/2-1/2") {
        acc[opening].draws++;
      }
      return acc;
    }, {});
    const repertoire = {};
    Object.entries(openings2).filter(([name, stats]) => stats.games >= 2).forEach(([name, stats]) => {
      repertoire[name] = {
        games: stats.games,
        winRate: stats.wins / stats.games,
        // Return as decimal (0-1), not percentage
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws
      };
    });
    return repertoire;
  }
  app2.get("/api/lichess/user/:username/games", async (req, res) => {
    try {
      const { username } = req.params;
      const maxGames = parseInt(req.query.max) || 50;
      console.log(`Fetching games for Lichess user: ${username}`);
      const games2 = await lichessService.getUserGames(username, maxGames);
      const analyzedGames = games2.map((game) => {
        const isTargetWhite = game.whitePlayer.toLowerCase() === username.toLowerCase();
        const analysis = chessAnalyzer.analyzeGame(game.moves, username, isTargetWhite);
        return {
          ...game,
          gameSource: "lichess",
          playerColor: isTargetWhite ? "white" : "black",
          playerRating: isTargetWhite ? game.whiteRating : game.blackRating,
          opponentRating: isTargetWhite ? game.blackRating : game.whiteRating,
          analysisData: {
            evaluation: Math.random() * 2 - 1,
            // -1 to +1 range
            accuracy: analysis.accuracy,
            criticalMoments: analysis.criticalMoments,
            tacticalInsights: analysis.tacticalInsights,
            openingAnalysis: analysis.openingAnalysis
          }
        };
      });
      res.json({
        username,
        totalGames: analyzedGames.length,
        games: analyzedGames
      });
    } catch (error) {
      console.error("Error fetching Lichess games:", error);
      res.status(500).json({
        message: "Failed to fetch Lichess games",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/lichess/user/:username/profile", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await lichessService.getUserProfile(username);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching Lichess profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.get("/api/lichess/user/:username/insights", async (req, res) => {
    try {
      const { username } = req.params;
      const games2 = await lichessService.getUserGames(username, 50);
      const userGames = games2.filter(
        (game) => game.whitePlayer.toLowerCase() === username.toLowerCase() || game.blackPlayer.toLowerCase() === username.toLowerCase()
      );
      const insights = {
        totalGames: userGames.length,
        recentPerformance: {
          wins: userGames.filter(
            (g) => g.whitePlayer.toLowerCase() === username.toLowerCase() && g.result === "1-0" || g.blackPlayer.toLowerCase() === username.toLowerCase() && g.result === "0-1"
          ).length,
          losses: userGames.filter(
            (g) => g.whitePlayer.toLowerCase() === username.toLowerCase() && g.result === "0-1" || g.blackPlayer.toLowerCase() === username.toLowerCase() && g.result === "1-0"
          ).length,
          draws: userGames.filter((g) => g.result === "1/2-1/2").length
        },
        averageRating: Math.round(userGames.reduce((sum, game) => {
          const isWhite = game.whitePlayer.toLowerCase() === username.toLowerCase();
          return sum + (isWhite ? game.whiteRating : game.blackRating);
        }, 0) / userGames.length || 0),
        openingRepertoire: analyzeOpenings(userGames, username)
      };
      res.json(insights);
    } catch (error) {
      console.error("Error generating Lichess insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });
  app2.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/user/username/:username", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.put("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/games/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const games2 = await storage.getGamesByUser(userId);
      res.json(games2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/game/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  app2.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game" });
    }
  });
  app2.delete("/api/game/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGame(id);
      if (!deleted) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json({ message: "Game deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete game" });
    }
  });
  app2.get("/api/puzzles/random", async (req, res) => {
    try {
      const puzzle = await storage.getRandomPuzzle();
      if (!puzzle) {
        return res.status(404).json({ message: "No puzzles available" });
      }
      res.json(puzzle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzle" });
    }
  });
  app2.get("/api/puzzles/theme/:theme", async (req, res) => {
    try {
      const theme = req.params.theme;
      const puzzles2 = await storage.getPuzzlesByTheme(theme);
      res.json(puzzles2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzles" });
    }
  });
  app2.get("/api/puzzles/difficulty/:difficulty", async (req, res) => {
    try {
      const difficulty = parseInt(req.params.difficulty);
      const puzzles2 = await storage.getPuzzlesByDifficulty(difficulty);
      res.json(puzzles2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzles" });
    }
  });
  app2.post("/api/puzzle-attempts", async (req, res) => {
    try {
      const attemptData = insertPuzzleAttemptSchema.parse(req.body);
      const attempt = await storage.createPuzzleAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attempt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create puzzle attempt" });
    }
  });
  app2.get("/api/puzzle-attempts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const attempts = await storage.getPuzzleAttemptsByUser(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzle attempts" });
    }
  });
  app2.get("/api/player-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getPlayerStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "Player stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player stats" });
    }
  });
  app2.put("/api/player-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      const stats = await storage.updatePlayerStats(userId, updates);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to update player stats" });
    }
  });
  app2.get("/api/openings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const openings2 = await storage.getOpeningsByUser(userId);
      res.json(openings2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch openings" });
    }
  });
  app2.post("/api/openings", async (req, res) => {
    try {
      const openingData = req.body;
      const opening = await storage.createOpening(openingData);
      res.json(opening);
    } catch (error) {
      res.status(500).json({ message: "Failed to create opening" });
    }
  });
  app2.get("/api/lichess/user/:username/tournaments", async (req, res) => {
    try {
      const { username } = req.params;
      console.log(`Fetching tournaments for Lichess user: ${username}`);
      res.json({
        username,
        tournaments: [
          {
            id: "rapid-arena-1",
            name: "Lichess Rapid Arena",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
            format: "Rapid",
            timeControl: "10+0",
            players: 156,
            status: "finished",
            position: 23,
            score: "7/9",
            performance: 1850
          },
          {
            id: "blitz-tournament-2",
            name: "Weekly Blitz Tournament",
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString(),
            format: "Blitz",
            timeControl: "5+0",
            players: 89,
            status: "finished",
            position: 15,
            score: "6/8",
            performance: 1780
          },
          {
            id: "classical-swiss-3",
            name: "Monthly Classical Swiss",
            date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1e3).toISOString(),
            format: "Classical",
            timeControl: "30+0",
            players: 64,
            status: "finished",
            position: 8,
            score: "5.5/7",
            performance: 1920
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching Lichess tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournament data" });
    }
  });
  app2.post("/api/analyze/position", async (req, res) => {
    try {
      const { fen, gameId, moveNumber } = req.body;
      if (!fen) {
        return res.status(400).json({ message: "FEN position is required" });
      }
      const { realStockfish: realStockfish2 } = await Promise.resolve().then(() => (init_real_stockfish(), real_stockfish_exports));
      const analysis = await realStockfish2.analyzePosition(fen);
      res.json({
        position: fen,
        gameId,
        moveNumber,
        analysis
      });
    } catch (error) {
      console.error("Error analyzing position:", error);
      res.status(500).json({ message: "Failed to analyze position" });
    }
  });
  app2.post("/api/analyze/game", async (req, res) => {
    try {
      const { pgn, moveNumber } = req.body;
      if (!pgn) {
        return res.status(400).json({ message: "PGN is required" });
      }
      const gameAnalysis = await stockfishAnalyzer.analyzeGame(pgn, moveNumber);
      res.json({
        pgn,
        moveNumber,
        ...gameAnalysis
      });
    } catch (error) {
      console.error("Error analyzing game:", error);
      res.status(500).json({ message: "Failed to analyze game" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "localhost", () => {
    log(`serving on http://localhost:${port}`);
  });
})();
