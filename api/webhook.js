import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  const update = req.body;

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (text === "/start") {
      await sendMessage(chatId,
        "👋 Welcome!\n\n🎥 Earn by watching ads\n💰 Withdraw real money"
      );
    }
  }

  res.status(200).send("OK");
}

async function sendMessage(chatId, text) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}
