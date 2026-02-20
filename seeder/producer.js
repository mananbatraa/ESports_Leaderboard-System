const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "seeder",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();

const ESPORTS = ["valorant", "cs2", "dota2", "pubg", "fortnite", "cod"];

function randomPlayerId() {
  return "player_" + Math.floor(Math.random() * 1000);
}

async function run() {
  await producer.connect();

  setInterval(async () => {
    const game = ESPORTS[Math.floor(Math.random() * ESPORTS.length)];
    const player = randomPlayerId();
    const score = Math.floor(Math.random() * 5000);

    const msg = { game, player, score };

    await producer.send({
      topic: "score_updates",
      messages: [{ value: JSON.stringify(msg) }],
    });

    console.log(`Sent → [${game}] ${player} ${score}`);
  }, 1000);
}

run();
