const DEFAULT_CHECKOUT_URL = "https://checkout.paycom.uz";

function toTiyin(amountInSom) {
  return Math.round(Number(amountInSom) * 100);
}

function base64Encode(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function buildPaymeCheckoutUrl({
  merchantId,
  orderId,
  amount,
  returnUrl,
  lang = "uz",
  checkoutUrl = DEFAULT_CHECKOUT_URL
}) {
  if (!merchantId) {
    throw new Error("PAYME_MERCHANT_ID kiritilmagan.");
  }

  if (!orderId) {
    throw new Error("orderId kiritilmagan.");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("amount noto'g'ri.");
  }

  const params = [
    `m=${merchantId}`,
    `ac.order_id=${orderId}`,
    `a=${toTiyin(amount)}`,
    `l=${lang}`
  ];

  if (returnUrl) {
    params.push(`c=${returnUrl}`);
  }

  return `${checkoutUrl.replace(/\/$/, "")}/${base64Encode(params.join(";"))}`;
}

module.exports = {
  buildPaymeCheckoutUrl,
  toTiyin
};
