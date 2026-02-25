import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const pay = async ({ amount, title, description }) => {
    setLoading(true);

    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ramdoot Foundation",
        description: description || title,
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.status === "success") {
            alert("Payment successful!");
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#1e293b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading };
}
