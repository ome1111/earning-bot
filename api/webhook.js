export default async function handler(req, res) {
  try {
    // Only handle POST requests
    if (req.method !== "POST") {
      return res.status(200).send("OK");
    }

    const update = req.body;

    // Make sure update has message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // Handle /start command
      if (text === "/start") {
        await fetch(
          `https://api.telegram.org/bot8584575386:AAHw7KdyrBthnrZwKK10LqpURqsCV8eM804/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "👋 Welcome!\n🎥 Earn by watching ads\n💰 Withdraw real money",
            }),
          }
        );
      }
    }

    // Respond to Telegram (must always return 200)
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Webhook error:", error);
    res.status(200).json({ ok: false });
  }
}
