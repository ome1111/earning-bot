import { MongoClient } from "mongodb";

const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const client = new MongoClient(MONGO_URI);
let db;

async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("earningBot");
  }
  return db;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(200).send("OK");

    const update = req.body;

    // Telegram sends either message or callback_query
    let chatId;
    if (update.message) chatId = update.message.chat.id;
    if (update.callback_query) chatId = update.callback_query.message.chat.id;

    if (!chatId) return res.status(200).send("OK");

    const database = await getDb();
    const users = database.collection("users");

    // Register user if new
    let user = await users.findOne({ chatId });
    if (!user) {
      user = { chatId, balance: 0, referrals: [], createdAt: new Date() };
      await users.insertOne(user);
    }

    // Handle /start
    if (update.message && update.message.text === "/start") {
      await sendMessage(chatId, "👋 Welcome!\n🎥 Earn by watching ads\n💰 Withdraw real money", getMenuButtons());
    }

    // Handle inline buttons
    if (update.callback_query) {
      const data = update.callback_query.data;

      if (data === "balance") {
        const u = await users.findOne({ chatId });
        await answerCallback(update.callback_query.id, `💰 Your Balance: $${u.balance}`);
      } else if (data === "earn") {
        await answerCallback(update.callback_query.id, "🎥 Watch Ads to earn! (Coming Soon)");
      } else if (data === "withdraw") {
        await answerCallback(update.callback_query.id, "💸 Withdraw Request (Coming Soon)");
      } else if (data === "referral") {
        const u = await users.findOne({ chatId });
        await answerCallback(update.callback_query.id, `👥 Your referrals: ${u.referrals.length}\nReferral Link: https://t.me/YourBotUsername?start=${chatId}`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.log("Webhook error:", err);
    res.status(200).json({ ok: false });
  }
}

// Send Telegram message with inline buttons
async function sendMessage(chatId, text, buttons = null) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: buttons })
  });
}

// Answer Telegram callback queries
async function answerCallback(callbackId, text) {
  await fetch(`${API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: true })
  });
}

// Inline menu buttons
function getMenuButtons() {
  return {
    inline_keyboard: [
      [{ text: "💰 Balance", callback_data: "balance" }, { text: "🎥 Earn", callback_data: "earn" }],
      [{ text: "💸 Withdraw", callback_data: "withdraw" }, { text: "👥 Referral", callback_data: "referral" }]
    ]
  };
}