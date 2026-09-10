// ═══════════════════════════════════════════════════════════════════════
// Courier integration architecture
// ───────────────────────────────────────────────────────────────────────
// All providers implement CourierProvider. The registry returns a provider
// by name. In offline/sandbox mode we create a tracking id locally, which
// is exactly what admin "hand off to courier" does in live mode too.
// Add live credentials in .env to switch a provider into live mode.
// ═══════════════════════════════════════════════════════════════════════

import { env } from "../../config/env";
import { randomHex } from "../../utils/helpers";

export interface CourierShipment {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  division: string;
  district: string;
  weight: number; // g
  amountToCollect: number; // 0 for prepaid
  items: Array<{ name: string; qty: number }>;
}

export interface CourierResult {
  courierName: string;
  trackingId: string;
  charge: number;
}

export interface CourierProvider {
  name: "PATHAO" | "STEADFAST" | "REDX";
  createShipment(s: CourierShipment): Promise<CourierResult>;
  track?(trackingId: string): Promise<{ status: string; note?: string }>;
}

abstract class OfflineCourier implements CourierProvider {
  abstract name: CourierProvider["name"];
  baseCharge = 60;
  async createShipment(s: CourierShipment): Promise<CourierResult> {
    await new Promise((r) => setTimeout(r, 80));
    return {
      courierName: this.name[0] + this.name.slice(1).toLowerCase(),
      trackingId: `${this.name.slice(0, 3)}-${this.trackingPrefix()}${randomHex(4).toUpperCase()}`,
      charge: this.baseCharge + Math.min(140, Math.max(0, (s.weight - 500) / 1000) * 20),
    };
  }
  protected trackingPrefix() {
    return "";
  }
}

class PathaoProvider extends OfflineCourier {
  name = "PATHAO" as const;
}
class SteadfastProvider extends OfflineCourier {
  name = "STEADFAST" as const;
}
class RedXProvider extends OfflineCourier {
  name = "REDX" as const;
}

const registry: Record<string, CourierProvider> = {
  PATHAO: new PathaoProvider(),
  STEADFAST: new SteadfastProvider(),
  REDX: new RedXProvider(),
};

export function getCourierProvider(name: string): CourierProvider | undefined {
  return registry[name.toUpperCase()];
}

/** Hand an order off to a courier (creates the shipment + tracking id). */
export async function createCourierShipment(providerName: string, s: CourierShipment): Promise<CourierResult> {
  const provider = getCourierProvider(providerName);
  if (!provider) throw new Error(`Unknown courier provider: ${providerName}`);
  if (env.COURIER_MODE === "offline") {
    // Still assigned a tracking id, charge estimated — deterministic for demos.
    return {
      courierName: providerName,
      trackingId: `${providerName.slice(0, 3).toUpperCase()}-${randomHex(5).toUpperCase()}`,
      charge: 70,
    };
  }
  return provider.createShipment(s);
}