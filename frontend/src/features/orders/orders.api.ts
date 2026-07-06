import { api } from "@/lib/api";

export interface CheckoutPayload {
  guestEmail?: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  items: { variantId: string; quantity: number }[];
  card: { number: string; exp: string; cvc: string };
}

export interface OrderResult {
  id: string;
  paymentRef?: string;
  totalUsd: string;
}

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    api.post<OrderResult>("/orders/checkout", payload),
};
