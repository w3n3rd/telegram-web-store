const {
  buildOrder,
  validatePayload,
  saveOrder,
  sendTelegramOrder
} = require("../lib/order-utils");

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({
      ok: false,
      message: "Faqat POST ruxsat etilgan."
    });
    return;
  }

  try {
    const payload = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const validationError = validatePayload(payload);

    if (validationError) {
      response.status(400).json({
        ok: false,
        message: validationError
      });
      return;
    }

    const order = buildOrder(payload);
    const botToken = process.env.BOT_TOKEN || "";
    const adminChatId = process.env.ADMIN_CHAT_ID || "";

    await saveOrder(order);
    await sendTelegramOrder(order, botToken, adminChatId);

    response.status(201).json({
      ok: true,
      message: "Buyurtma qabul qilindi.",
      orderId: order.id
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: "Serverda xatolik yuz berdi."
    });
  }
};
