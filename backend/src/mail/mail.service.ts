import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

export interface OrderItemEmail {
  productName: string;
  size?: string | null;
  color?: string | null;
  unitPriceUsd: number;
  quantity: number;
}

export interface OrderEmailData {
  to: string;
  orderId: string;
  paymentRef?: string | null;
  totalUsd: number;
  items: OrderItemEmail[];
}

// Textos editables por defecto (si el admin no los ha configurado).
const DEFAULTS: Record<string, string> = {
  email_welcome_subject: "¡Bienvenido a Chilate!",
  email_welcome_body:
    "Gracias por crear tu cuenta en Chilate. Nos alegra tenerte aquí. Explora nuestra tienda y encuentra tu estilo.",
  email_order_subject: "Gracias por tu compra en Chilate",
  email_order_intro:
    "¡Gracias por tu compra! Estos son los detalles de tu pedido:",
  email_order_outro:
    "Te avisaremos cuando tu pedido esté en camino. ¡Gracias por elegir Chilate!",
  email_delivery_estimate: "3 a 5 días hábiles",
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const user = this.config.get<string>("GMAIL_USER");
    const pass = this.config.get<string>("GMAIL_APP_PASSWORD");
    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        "GMAIL_USER/GMAIL_APP_PASSWORD no configurados: los correos se omiten.",
      );
    }
  }

  private async texts(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteContent.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const row of rows as { key: string; valueEs: string | null }[]) {
      if (row.key in DEFAULTS && row.valueEs) map[row.key] = row.valueEs;
    }
    return map;
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) return; // no configurado: se omite sin romper
    const from = this.config.get<string>("GMAIL_USER");
    try {
      await this.transporter.sendMail({
        from: `Chilate <${from}>`,
        to,
        subject,
        html,
      });
    } catch (e) {
      this.logger.error(
        `No se pudo enviar el correo a ${to}: ${(e as Error).message}`,
      );
    }
  }

  async sendWelcome(to: string) {
    const t = await this.texts();
    await this.send(to, t.email_welcome_subject, layout(t.email_welcome_body));
  }

  async sendOrderConfirmation(data: OrderEmailData) {
    const t = await this.texts();
    const rows = data.items
      .map(
        (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">
            ${escape(i.productName)}
            <div style="color:#888;font-size:12px">
              ${[i.size, i.color].filter(Boolean).map(escape).join(" · ")}
            </div>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">$${i.unitPriceUsd.toFixed(2)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">$${(i.unitPriceUsd * i.quantity).toFixed(2)}</td>
        </tr>`,
      )
      .join("");

    const body = `
      <p>${escape(t.email_order_intro)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
        <thead>
          <tr style="text-align:left;color:#888;font-size:12px">
            <th style="padding:8px 0">Producto</th>
            <th style="padding:8px 0;text-align:center">Cant.</th>
            <th style="padding:8px 0;text-align:right">P. unitario</th>
            <th style="padding:8px 0;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:16px;font-weight:600">
        Total: $${data.totalUsd.toFixed(2)}
      </p>
      <p style="background:#eef2ff;color:#4338ca;padding:12px;border-radius:8px">
        Tiempo estimado de entrega: <strong>${escape(t.email_delivery_estimate)}</strong>
      </p>
      <p>${escape(t.email_order_outro)}</p>
      <p style="color:#888;font-size:12px">Referencia: ${escape(data.paymentRef ?? data.orderId)}</p>
    `;
    await this.send(data.to, t.email_order_subject, layout(body));
  }
}

function escape(s?: string | null): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Envoltura HTML con la marca.
function layout(inner: string): string {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#27272a">
    <div style="background:#4f46e5;color:#fff;padding:20px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:20px">Chilate</h1>
    </div>
    <div style="border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      ${inner}
    </div>
    <p style="text-align:center;color:#aaa;font-size:12px;margin-top:16px">
      © ${new Date().getFullYear()} Chilate
    </p>
  </div>`;
}
