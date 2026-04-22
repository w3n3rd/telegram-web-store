function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""
  };
}

function normalizeSupabaseUrl(url) {
  return url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "");
}

function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

async function insertRow(table, row) {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    return { skipped: true, reason: "missing_supabase_config" };
  }

  const baseUrl = normalizeSupabaseUrl(url);
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(row)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.hint || `Supabase insert xatoligi: ${response.status}`;
    throw new Error(message);
  }

  return { skipped: false, data };
}

async function saveOrderToSupabase(order) {
  return insertRow("orders", {
    id: order.id,
    created_at: order.createdAt,
    customer: order.customer,
    items: order.items,
    total: order.total,
    status: order.status || "new"
  });
}

module.exports = {
  isSupabaseConfigured,
  saveOrderToSupabase
};
