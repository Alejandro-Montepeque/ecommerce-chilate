import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

export interface PaymentResult {
  status: "approved" | "declined";
  paymentRef?: string;
  reason?: string;
}

// Pasarela SIMULADA. Misma firma que tendría una real (Wompi/Stripe),
// así el día que se integre el cobro real solo se cambia esta clase.
@Injectable()
export class PaymentsService {
  async charge(cardNumber: string, _amount: number): Promise<PaymentResult> {
    // Simula latencia de red de una pasarela real.
    await new Promise((r) => setTimeout(r, 1000));

    const digits = (cardNumber ?? "").replace(/\D/g, "");
    const approved = digits.length >= 12 && Number(digits.slice(-1)) % 2 === 0;

    if (!approved) {
      return { status: "declined", reason: "Tarjeta rechazada (simulación)" };
    }
    return {
      status: "approved",
      paymentRef: `SIM-${randomUUID().slice(0, 8).toUpperCase()}`,
    };
  }
}
