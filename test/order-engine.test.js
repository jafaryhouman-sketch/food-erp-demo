import test from "node:test";
import assert from "node:assert/strict";
import { createOrder, syncOrders } from "../src/order-engine.js";

const stock = { A: 10, B: 5 };
const quota = { A: 8, B: 5 };

test("ثبت سفارش معتبر", () => {
  const order = createOrder({
    externalId: "ORD-1",
    items: [{ sku: "A", qty: 2 }],
    stock,
    quota
  });
  assert.equal(order.status, "pending_sync");
});

test("سفارش در انتظار همگام‌سازی است", () => {
  const order = createOrder({
    externalId: "ORD-2",
    items: [{ sku: "A", qty: 1 }],
    stock,
    quota
  });
  assert.equal(order.status, "pending_sync");
});

test("تعداد صفر یا منفی پذیرفته نمی‌شود", () => {
  assert.throws(() => createOrder({
    externalId: "ORD-3",
    items: [{ sku: "A", qty: 0 }],
    stock,
    quota
  }), /INVALID_ITEM/);
});

test("بیشتر از موجودی پذیرفته نمی‌شود", () => {
  assert.throws(() => createOrder({
    externalId: "ORD-4",
    items: [{ sku: "A", qty: 11 }],
    stock,
    quota
  }), /INSUFFICIENT_STOCK/);
});

test("بیشتر از سهمیه پذیرفته نمی‌شود", () => {
  assert.throws(() => createOrder({
    externalId: "ORD-5",
    items: [{ sku: "A", qty: 9 }],
    stock,
    quota
  }), /QUOTA_EXCEEDED/);
});

test("همگام‌سازی سفارش جدید", () => {
  const store = new Map();
  const result = syncOrders([
    { externalId: "ORD-6", items: [] }
  ], store);
  assert.equal(result[0].syncStatus, "synced");
});

test("شناسه تکراری دوباره ثبت نمی‌شود", () => {
  const store = new Map([["ORD-7", { externalId: "ORD-7" }]]);
  const result = syncOrders([
    { externalId: "ORD-7", items: [] }
  ], store);
  assert.equal(result[0].syncStatus, "duplicate_ignored");
});
