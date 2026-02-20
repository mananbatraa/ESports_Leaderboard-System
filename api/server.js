const express = require("express");
const Redis = require("redis");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

const redis = Redis.createClient({ url: "redis://redis:6379" });
redis.connect();

mongoose.connect("mongodb://mongodb:27017/leaderboard");

const PlayerSchema = new mongoose.Schema({
  name: String,
  score: Number,
  game: String,
});
const Player = mongoose.model("Player", PlayerSchema);

// ⬅️ NEW: Leaderboard per game
app.get("/leaderboard/:game", async (req, res) => {
  const { game } = req.params;
  const key = `leaderboard_${game}`;

  const players = await redis.zRangeWithScores(key, 0, -1, { REV: true });
  res.json(players);
});

// ⬅️ NEW: Get players of a specific game
app.get("/player/:game/:name", async (req, res) => {
  const { game, name } = req.params;

  const player = await Player.findOne({ name, game });
  res.json(player);
});

app.listen(5002, () => console.log("API running on :5002"));
