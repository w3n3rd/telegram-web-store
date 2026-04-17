const http = require("http");
const path = require("path");
const {
  buildOrder,
  validatePayload,
  saveOrderLocally,
  sendTelegramOrder
} = require("./lib/order-utils");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveFile(filePath, response) {
  const fs = require("fs");
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("File topilmadi.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/order") {
    try {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");

      const validationError = validatePayload(payload);

      if (validationError) {
        sendJson(response, 400, {
          ok: false,
          message: validationError
        });
        return;
      }

      const order = buildOrder(payload);
      saveOrderLocally(order);
      await sendTelegramOrder(order, BOT_TOKEN, ADMIN_CHAT_ID);

      sendJson(response, 201, {
        ok: true,
        message: "Buyurtma qabul qilindi.",
        orderId: order.id
      });
      return;
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        message: "Serverda xatolik yuz berdi."
      });
      return;
    }
  }

  const safePath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.join(PUBLIC_DIR, path.normalize(safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Ruxsat yoq.");
    return;
  }

  serveFile(filePath, response);
});

server.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
