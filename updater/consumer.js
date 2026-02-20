const { Kafka } = require("kafkajs");
const Redis = require("redis");
const mongoose = require("mongoose");

mongoose.connect("mongodb://mongodb:27017/leaderboard");

const PlayerSchema = new mongoose.Schema({
  name: String,
  game: String,
  score: Number,
});
const Player = mongoose.model("Player", PlayerSchema);

const redis = Redis.createClient({ url: "redis://redis:6379" });
redis.connect();

const kafka = new Kafka({
  clientId: "updater",
  brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "score-group" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "score_updates" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const update = JSON.parse(message.value.toString());

      // Ensure the game exists
      if (!update.game) {
        console.error("❌ Missing game in update:", update);
        return;
      }

      // Save to Redis sorted set
      await redis.zAdd(`leaderboard_${update.game}`, {
        score: update.score,
        value: update.player,
      });

      // Save to MongoDB
      await Player.findOneAndUpdate(
        { name: update.player, game: update.game },
        { score: update.score },
        { upsert: true }
      );

      console.log(`✔️ Updated [${update.game}] ${update.player}: ${update.score}`);
    },
  });
}

run();
