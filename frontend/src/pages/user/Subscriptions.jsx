import { useState, useEffect } from "react";
import Button from "@/components/Button.jsx";
import { ORG } from "@/config/constants";
import { CheckCircleIcon } from "@/components/ui/icons";
import { toastSuccess, toastError } from "@/lib/confirm";
import { subscriptionsApi, paymentsApi, listOf } from "@/lib/api";

/**
 * Subscription plans page — a hero panel with the featured plan card floating
 * over its right edge. See design/User - subscriptions.png.
 */
const PLAN = {
  id: null,
  badge: "Most Popular",
  name: "Senior plan",
  price: 45,
  cadence: "per month",
  tagline: "Our most popular plan.",
  features: [
    "Access to basic features",
    "Access to basic features",
    "Access to basic features",
    "Access to basic features",
  ],
};

// Random-ish provider ref for the dev payment record.
const ref = () => Math.random().toString(36).slice(2, 12);

/**
 * Record a payment and return its id.
 *
 * NOTE: no Razorpay order endpoint / checkout SDK exists yet, so this creates a
 * dev payment record straight away (the backend marks `POST /payments` as
 * SUCCESS). When the real gateway lands, replace ONLY this function with a
 * Razorpay checkout that resolves to the verified payment id.
 */
async function initiatePayment(plan) {
  const payment = await paymentsApi.record({
    razorpayOrderId: `order_dev_${ref()}`,
    razorpayPaymentId: `pay_dev_${ref()}`,
    amount: Math.round(Number(plan.price) * 100), // backend expects paise
    relatedType: "subscription",
    relatedId: plan.id,
    description: `Subscription: ${plan.name}`,
  });
  return payment.id;
}

export default function Subscriptions() {
  const [plan, setPlan] = useState(PLAN);
  const [mySub, setMySub] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    let alive = true;

    subscriptionsApi
      .plans()
      .then((res) => {
        const plans = listOf(res);
        if (!alive || !plans.length) return;
        const p = plans[0];
        setPlan({
          ...PLAN,
          id: p.id,
          name: p.name,
          price: Number(p.price ?? PLAN.price),
          cadence: p.billingCycle
            ? `per ${String(p.billingCycle).toLowerCase().replace("ly", "")}`
            : PLAN.cadence,
          tagline: p.description || PLAN.tagline,
        });
      })
      .catch((err) => console.warn("plans", err.message));

    // Detect an existing active subscription so the card reflects owned state.
    subscriptionsApi
      .mine()
      .then((res) => {
        if (!alive) return;
        const active = listOf(res).find(
          (s) => String(s.status || "").toUpperCase() === "ACTIVE",
        );
        if (active) setMySub(active);
      })
      .catch((err) => console.warn("mine", err.message));

    return () => {
      alive = false;
    };
  }, []);

  const owned =
    mySub &&
    String(mySub.status || "").toUpperCase() === "ACTIVE" &&
    (!plan.id || mySub.planId === plan.id);

  async function handleGetPlan() {
    if (!plan.id) {
      toastError("Plan is not available yet. Please try again in a moment.");
      return;
    }
    setPurchasing(true);
    try {
      const paymentId = await initiatePayment(plan);
      const sub = await subscriptionsApi.purchase({ planId: plan.id, paymentId });
      setMySub(sub);
      toastSuccess("Subscription activated");
    } catch (err) {
      toastError(err.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <section className="relative">
      {/* Hero panel — kept tall on desktop so the floating card sits centered
          over its right edge without overflowing up into the top bar. */}
      <div className="flex min-h-65 flex-col justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-50 px-6 py-12 md:px-12 lg:min-h-110 lg:pr-104">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Subscription Plans
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500">
          Choose your subscription plans to get magazines every month
        </p>
      </div>

      {/* Featured plan card */}
      <div className="mt-6 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:w-80 lg:-translate-y-1/2">
        <div className="bg-btn-primary py-2.5 text-center text-sm font-medium text-white">
          {plan.badge}
        </div>

        <div className="p-6">
          <p className="text-sm font-medium text-slate-700">{plan.name}</p>

          <div className="mt-2 flex items-start gap-1">
            <span className="mt-1 text-2xl font-bold text-slate-900">
              {ORG.currencySymbol}
            </span>
            <span className="text-5xl font-bold leading-none text-slate-900">
              {plan.price}
            </span>
            <span className="mt-auto mb-1 text-sm text-slate-500">
              {plan.cadence}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">{plan.tagline}</p>

          <div className="mt-5">
            {owned ? (
              <Button text="Current plan" width="100%" disabled />
            ) : (
              <Button
                text="Get this plan"
                width="100%"
                handler={handleGetPlan}
                loading={purchasing}
              />
            )}
            {owned && mySub?.endDate && (
              <p className="mt-2 text-center text-xs text-slate-500">
                Active until {new Date(mySub.endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Features
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Everything in our{" "}
              <span className="font-semibold text-slate-900">free plan</span>{" "}
              plus…
            </p>

            <ul className="mt-4 space-y-3">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-slate-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
