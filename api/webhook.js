const BOT_TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  try {
    const update = req.body;

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === "/start") {
        await fetch(`${API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👋 Welcome!\n\n🎥 Earn by watching ads\n💰 Withdraw real money"
          })
        });
      }
    }

    res.status(200).send("OK");
  } catch (e) {
    res.status(200).send("ERROR");
  }
}
