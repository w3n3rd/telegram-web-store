const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

function loadEnvFile() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";
const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : "";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi. .env faylga token yozing.");
  process.exit(1);
}

if (!WEB_APP_URL) {
  console.error("WEB_APP_URL topilmadi. .env faylga public https link yozing.");
  process.exit(1);
}

let offset = 0;

async function callTelegram(method, payload = {}) {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description || `Telegram API xatoligi: ${method}`);
  }

  return result.result;
}

function buildStoreKeyboard() {
  return {
    keyboard: [
      [
        {
          text: "Do'konni ochish",
          web_app: {
            url: WEB_APP_URL
          }
        }
      ]
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

async function sendWelcome(chatId, firstName = "") {
  const safeName = firstName ? `${firstName}, ` : "";

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text:
      `${safeName}do'konimizga xush kelibsiz.\n\n` +
      "Pastdagi tugmani bosib web store'ni ochishingiz mumkin.",
    reply_markup: buildStoreKeyboard()
  });
}

async function notifyAdmin(message) {
  if (!ADMIN_CHAT_ID) {
    return;
  }

  await callTelegram("sendMessage", {
    chat_id: ADMIN_CHAT_ID,
    text: message
  });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || "";
  const firstName = message.from?.first_name || "";

  if (text === "/start" || text === "/shop") {
    await sendWelcome(chatId, firstName);
    return;
  }

  if (text === "/help") {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text:
        "Buyruqlar:\n" +
        "/start - do'kon tugmasini olish\n" +
        "/shop - do'konni qayta ochish\n" +
        "/help - yordam"
    });
    return;
  }

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: "Do'konni ochish uchun /start yoki /shop yuboring.",
    reply_markup: buildStoreKeyboard()
  });
}

async function pollUpdates() {
  try {
    const updates = await callTelegram("getUpdates", {
      offset,
      timeout: 25
    });

    for (const update of updates) {
      offset = update.update_id + 1;

      if (update.message) {
        await handleMessage(update.message);
      }
    }
  } catch (error) {
    console.error("Polling xatoligi:", error.message);
    await notifyAdmin(`Bot xatoligi: ${error.message}`);
  } finally {
    setTimeout(pollUpdates, 1000);
  }
}

async function start() {
  console.log("Telegram bot ishga tushmoqda...");
  console.log(`Web App URL: ${WEB_APP_URL}`);

  try {
    await callTelegram("deleteWebhook");
    await notifyAdmin("Bot ishga tushdi.");
    pollUpdates();
  } catch (error) {
    console.error("Botni ishga tushirib bo'lmadi:", error.message);
    process.exit(1);
  }
}

start();
