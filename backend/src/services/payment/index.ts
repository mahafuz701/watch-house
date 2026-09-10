// ═══════════════════════════════════════════════════════════════════════
// Payment gateway architecture
// ───────────────────────────────────────────────────────────────────────
// Every gateway implements the same interface. The factory returns the
// implementation for the requested method. In sandbox mode (default) the
// full purchase + webhook verification flow works end-to-end with a mock
// checkout page. Production gateways (bKash tokenized, Nagad, SSLCommerz)
// plug into the same interface — only their network SDK calls change.
// Sensitive credentials NEVER leave the server and are never stored.
// ═══════════════════════════════════════════════════════════════════════

import { env } from "../../config/env";
import { randomHex } from "../../utils/helpers";
import { prisma } from "../../db/prisma";

export type PaymentMethod = "COD" | "BKASH" | "NAGAD" | "CARD";

export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customer: { name: string; phone: string; email?: string };
}

export interface PaymentSession {
  gateway: string;
  redirectUrl?: string;
  gatewayPayload?: Record<string, unknown>;
}

export interface PaymentGateway {
  name: string;
  create(input: CreatePaymentInput): Promise<PaymentSession>;
  verify(input: { transactionId: string; gatewayPayload?: Record<string, unknown>; amount: number }): Promise<{
    success: boolean;
    transactionId?: string;
    reference?: string;
    failureReason?: string;
  }>;
}

// ── Implementation helpers ───────────────────────────────────────────────

async function persistPayment(
  input: CreatePaymentInput,
  gateway: string,
  method: PaymentMethod,
  reference: string,
  status: "PENDING" | "PAID" | "FAILED" = "PENDING"
) {
  return prisma.payment.create({
    data: {
      orderId: input.orderId,
      method,
      gateway,
      status,
      amount: input.amount,
      currency: input.currency || "BDT",
      reference,
    },
  });
}

// ── Cash on Delivery ─────────────────────────────────────────────────────

class CODGateway implements PaymentGateway {
  name = "COD";
  async create(input: CreatePaymentInput) {
    await persistPayment(input, "internal", "COD", `COD-${input.orderNumber}`, "PENDING");
    return { gateway: "COD" };
  }
  async verify() {
    return { success: true };
  }
}

// ── Sandbox gateway (simulates bKash / Nagad / SSLCommerz) ──────────────

export class SandboxGateway implements PaymentGateway {
  name = "Sandbox";
  constructor(private method: PaymentMethod) {}
  async create(input: CreatePaymentInput) {
    const reference = `SANDBOX-${randomHex(6)}`;
    await persistPayment(input, this.method === "CARD" ? "SSLCommerz" : this.method, this.method, reference, "PENDING");
    const redirectUrl = `${env.SITE_URL}/api/payments/mock-checkout?reference=${reference}&amount=${input.amount}&method=${this.method}&order=${input.orderNumber}`;
    return { gateway: this.method === "CARD" ? "SSLCommerz" : this.method, redirectUrl, gatewayPayload: { reference } };
  }
  async verify(input: { transactionId: string; gatewayPayload?: Record<string, unknown>; amount: number }) {
    const transactionId = `TXN${input.transactionId.slice(-20)}`;
    return { success: true, transactionId, reference: input.transactionId };
  }
}

const useSandbox = () => env.PAYMENT_MODE !== "live";

function productionBkash(): PaymentGateway {
  return {
    name: "BKASH",
    async create() {
      throw new Error("bKash production requires APP_KEY/APP_SECRET — implement the tokenized API per bKash docs.");
    },
    async verify() {
      return { success: false, failureReason: "Not configured" };
    },
  };
}

function productionNagad(): PaymentGateway {
  return {
    name: "NAGAD",
    async create() {
      throw new Error("Nagad production requires merchant credentials — implement per Nagad API docs.");
    },
    async verify() {
      return { success: false, failureReason: "Not configured" };
    },
  };
}

function productionSSLCommerz(): PaymentGateway {
  return {
    name: "SSLCommerz",
    async create() {
      throw new Error("SSLCommerz production requires store credentials — implement per SSLCommerz API docs.");
    },
    async verify() {
      return { success: false, failureReason: "Not configured" };
    },
  };
}
// ═══════════════════════════════════════════════════════════════════════
// Public factory & orchestration
// ═══════════════════════════════════════════════════════════════════════

export function getPaymentGateway(method: PaymentMethod): PaymentGateway {
  if (method === "COD") return new CODGateway();
  if (useSandbox()) return new SandboxGateway(method);
  if (method === "BKASH") return productionBkash();
  if (method === "NAGAD") return productionNagad();
  return productionSSLCommerz();
}

export interface PaymentResult {
  status: "PENDING" | "PAID" | "FAILED";
  transactionId?: string;
  reference?: string;
  redirectUrl?: string;
  failureReason?: string;
}

/** High-level orchestration used by the orders module. */
export async function processOrderPayment(input: CreatePaymentInput & { method: PaymentMethod }): Promise<PaymentResult> {
  const gateway = getPaymentGateway(input.method);
  const session = await gateway.create(input);

  if (input.method === "COD") return { status: "PENDING" };

  if (useSandbox()) {
    return {
      status: "PENDING",
      reference: (session.gatewayPayload as { reference?: string })?.reference,
      redirectUrl: session.redirectUrl,
    };
  }
  return { status: "PENDING", redirectUrl: session.redirectUrl };
}

/** Shared by the webhook handler + the sandbox mock checkout completion. */
export async function verifyGatewayPayment(
  paymentReference: string,
  amount: number,
  gatewayPayload: Record<string, unknown>,
  gateway: string
): Promise<PaymentResult> {
  if (gateway === "internal" || gateway === "COD") {
    return { status: "PAID", transactionId: paymentReference };
  }
  const method: PaymentMethod = gateway === "SSLCommerz" ? "CARD" : gateway === "BKASH" ? "BKASH" : gateway === "NAGAD" ? "NAGAD" : "CARD";
  const gatewayObj = getPaymentGateway(method);
  const result = await gatewayObj.verify({ transactionId: paymentReference, gatewayPayload, amount });
  if (!result.success) return { status: "FAILED", failureReason: result.failureReason };
  return { status: "PAID", transactionId: result.transactionId, reference: result.reference };
}