import { useMutation } from "@tanstack/react-query";
import { ordersApi, type CheckoutPayload } from "./orders.api";

export function useCheckout() {
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => ordersApi.checkout(payload),
  });
}
