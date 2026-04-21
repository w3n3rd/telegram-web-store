const fs = require("fs");
const path = require("path");
const { saveOrderToSupabase } = require("./supabase");

const DATA_DIR = path.join(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
  }
}

function buildOrder(payload) {
  const now = new Date();

  return {
    id: `ORD-${now.getTime()}`,
    createdAt: now.toISOString(),
    customer: {
      fullName: payload.fullName,
      phone: payload.phone,
      address: payload.address,
      note: payload.note || ""
    },
    items: payload.items,
    total: payload.total,
    status: payload.status || "new"
  };
}

function validatePayload(payload) {
  if (!payload.fullName || !payload.phone || !payload.address) {
    return "Ism, telefon va manzil majburiy.";
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return "Kamida bitta mahsulot tanlang.";
  }

  return "";
}

function saveOrderLocally(order) {
  ensureDataFile();
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  const orders = JSON.parse(raw);
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

async function saveOrder(order) {
  try {
    const result = await saveOrderToSupabase(order);

    if (result.skipped) {
      saveOrderLocally(order);
    }

    return result;
  } catch (error) {
    console.error("Supabase saqlash xatoligi:", error.message);
    saveOrderLocally(order);
    return { skipped: true, reason: "supabase_error_saved_locally" };
  }
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("uz-UZ")} so'm`;
}

function formatOrderMessage(order) {
  const itemLines = order.items
    .map((item) => `- ${item.name} x ${item.quantity} = ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  return [
    "Yangi buyurtma keldi",
    "",
    `ID: ${order.id}`,
    `Mijoz: ${order.customer.fullName}`,
    `Telefon: ${order.customer.phone}`,
    `Manzil: ${order.customer.address}`,
    `Izoh: ${order.customer.note || "-"}`,
    "",
    "Mahsulotlar:",
    itemLines,
    "",
    `Jami: ${formatPrice(order.total)}`
  ].join("\n");
}

async function sendTelegramOrder(order, token, chatId) {
  if (!token || !chatId) {
    return { sent: false, reason: "missing_credentials" };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatOrderMessage(order)
    })
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description || "Telegramga yuborib bo'lmadi.");
  }

  return { sent: true };
}

module.exports = {
  buildOrder,
  validatePayload,
  saveOrder,
  saveOrderLocally,
  sendTelegramOrder
};
