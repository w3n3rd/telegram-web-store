const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

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

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
  }
}

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

function saveOrder(order) {
  ensureDataFile();
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  const orders = JSON.parse(raw);
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

function serveFile(filePath, response) {
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
    total: payload.total
  };
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/order") {
    try {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");

      if (!payload.fullName || !payload.phone || !payload.address) {
        sendJson(response, 400, {
          ok: false,
          message: "Ism, telefon va manzil majburiy."
        });
        return;
      }

      if (!Array.isArray(payload.items) || payload.items.length === 0) {
        sendJson(response, 400, {
          ok: false,
          message: "Kamida bitta mahsulot tanlang."
        });
        return;
      }

      const order = buildOrder(payload);
      saveOrder(order);

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

ensureDataFile();

server.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
