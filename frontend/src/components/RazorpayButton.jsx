import { useState } from "react";
import { RAZORPAY_KEY_ID, ORG } from "@/config/constants";
import { paymentsApi, getStoredUser } from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/confirm";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Razorpay checkout.
 *
 * Flow: POST /payments/create-order opens the order and writes a PENDING
 * payment row, then the checkout widget takes over. There is NO client-side
 * verify call — the backend reconciles the payment from Razorpay's
 * `POST /webhooks/razorpay` callback, so a successful `handler` here only means
 * the user finished checkout, not that the payment is confirmed. Callers that
 * need certainty should re-read `paymentsApi.mine()` afterwards.
 *
 * `amount` is in RUPEES (the backend converts to paise).
 */
export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const pay = async ({ amount, relatedType, relatedId, description, onSuccess } = {}) => {
    if (!amount || amount <= 0) {
      toastError("Nothing to pay for");
      return;
    }

    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toastError("Razorpay could not load. Check your internet connection.");
        return;
      }

      const order = await paymentsApi.createOrder({
        amount,
        relatedType,
        relatedId,
        description,
      });

      const user = getStoredUser();
      const rzp = new window.Razorpay({
        // The backend returns the key it opened the order with — prefer it so
        // the two can never drift apart.
        key: order.keyId || RAZORPAY_KEY_ID,
        amount: order.amount, // already in paise
        currency: order.currency,
        name: ORG.name,
        description,
        order_id: order.orderId,
        // Razorpay hands back { razorpay_payment_id, razorpay_order_id,
        // razorpay_signature }. Pass it on — callers need the payment id to
        // find the payment row this order created.
        handler: (response) => {
          toastSuccess("Payment received — we'll confirm it shortly.");
          onSuccess?.(order, response);
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: ORG.theme || "#1e293b" },
      });

      rzp.on("payment.failed", (res) => {
        toastError(res?.error?.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      toastError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading };
}
