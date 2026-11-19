export function createOrder({
  externalId,
  items,
  stock,
  quota
}) {
  if (!externalId || !Array.isArray(items) || items.length === 0) {
    throw new Error("INVALID_ORDER");
  }

  const seen = new Set();

  for (const item of items) {
    if (!item.sku || !Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error("INVALID_ITEM");
    }

    if (seen.has(item.sku)) {
      throw new Error("DUPLICATE_ITEM");
    }
    seen.add(item.sku);

    if (item.qty > (stock[item.sku] ?? 0)) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    if (item.qty > (quota[item.sku] ?? 0)) {
      throw new Error("QUOTA_EXCEEDED");
    }
  }

  return {
    externalId,
    items,
    status: "pending_sync"
  };
}

export function syncOrders(orders, serverStore = new Map()) {
  return orders.map(order => {
    if (serverStore.has(order.externalId)) {
      return { ...order, syncStatus: "duplicate_ignored" };
    }

    serverStore.set(order.externalId, order);
    return { ...order, syncStatus: "synced" };
  });
}
