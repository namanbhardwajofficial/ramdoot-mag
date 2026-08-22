import { useState, useEffect, useCallback } from "react";
import Button from "@/components/Button.jsx";
import { ORG } from "@/config/constants";
import { CheckCircleIcon } from "@/components/ui/icons";
import { toastSuccess, toastError } from "@/lib/confirm";
import { subscriptionsApi, paymentsApi, listOf } from "@/lib/api";
import { useRazorpay } from "@/components/RazorpayButton";

/**
 * Subscription plans page — hero panel above a grid of the real plans returned
 * by GET /subscription-plans, each with a Razorpay checkout.
 *
 * Payment flow, and why it takes two steps:
 *   1. `pay()` opens a Razorpay order. The backend writes a PENDING payment row
 *      whose `paymentProviderId` is the ORDER id, but it does not return that
 *      row's id — only `{ orderId, amount, currency, keyId }`.
 *   2. `POST /subscriptions/purchase` needs that row's id, so after checkout we
 *      look the row up in `paymentsApi.mine()`.
 *
 * The lookup matches on the order id OR the Razorpay payment id because the
 * `payment.captured` webhook REWRITES `paymentProviderId` from the former to
 * the latter. Whether the webhook has landed yet is a race, so we accept both
 * and the result is deterministic either way.
 *
 * The webhook only flips the payment to SUCCESS — it never creates the
 * subscription — so this call is required to actually grant access.
 */

function cadenceLabel(billingCycle) {
  const c = String(billingCycle || "").toUpperCase();
  if (c === "MONTHLY") return "per month";
  if (c === "QUARTERLY") return "per quarter";
  if (c === "YEARLY") return "per year";
  return "";
}

// Included magazines double as the plan's feature list.
function featuresOf(plan) {
  const titles = (plan.magazines || [])
    .map((m) => m.magazine?.title)
    .filter(Boolean);
  return titles.length ? titles : ["Access to all published magazines"];
}

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [mySubs, setMySubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPlanId, setPendingPlanId] = useState(null);
  const { pay } = useRazorpay();

  const loadMine = useCallback(
    () =>
      subscriptionsApi
        .mine()
        .then((res) => setMySubs(listOf(res)))
        .catch((err) => console.warn("mine", err.message)),
    [],
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      subscriptionsApi
        .plans()
        .then((res) => {
          if (alive) setPlans(listOf(res));
        })
        .catch((err) => {
          console.warn("plans", err.message);
          if (alive) toastError("Could not load subscription plans");
        }),
      loadMine(),
    ]).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [loadMine]);

  const activePlanIds = new Set(
    mySubs
      .filter((s) => String(s.status || "").toUpperCase() === "ACTIVE")
      .map((s) => s.planId),
  );

  // Resolve the payment row created by this order — see the note above on why
  // either id can be the one stored.
  async function findPaymentId(orderId, razorpayPaymentId) {
    const rows = listOf(await paymentsApi.mine());
    const match = rows.find(
      (p) =>
        p.paymentProviderId === orderId ||
        (razorpayPaymentId && p.paymentProviderId === razorpayPaymentId),
    );
    return match?.id || null;
  }

  async function handleGetPlan(plan) {
    setPendingPlanId(plan.id);
    await pay({
      amount: Number(plan.price), // rupees; the backend converts to paise
      relatedType: "subscription",
      relatedId: plan.id,
      description: `Subscription: ${plan.name}`,
      onSuccess: async (order, response) => {
        try {
          const paymentId = await findPaymentId(
            order.orderId,
            response?.razorpay_payment_id,
          );
          if (!paymentId) {
            toastError(
              "Payment went through but we could not link it to your account. Please contact support.",
            );
            return;
          }
          await subscriptionsApi.purchase({ planId: plan.id, paymentId });
          await loadMine();
          toastSuccess("Subscription activated");
        } catch (err) {
          toastError(err.message || "Could not activate your subscription");
        } finally {
          setPendingPlanId(null);
        }
      },
    });
    // pay() resolves once the widget is open (or failed to open); clear the
    // spinner unless onSuccess is still finishing the purchase.
    setPendingPlanId((id) => (id === plan.id ? null : id));
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading plans…</div>;
  }

  return (
    <section>
      <div className="flex min-h-40 flex-col justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-50 px-6 py-10 md:px-12">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Subscription Plans
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500">
          Choose your subscription plans to get magazines every month
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          No subscription plans are available right now.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, i) => {
            const owned = activePlanIds.has(plan.id);
            return (
              <div
                key={plan.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className={`py-2.5 text-center text-sm font-medium ${
                    i === 0
                      ? "bg-btn-primary text-white"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {i === 0 ? "Most Popular" : cadenceLabel(plan.billingCycle) || "Plan"}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm font-medium text-slate-700">{plan.name}</p>

                  <div className="mt-2 flex items-start gap-1">
                    <span className="mt-1 text-2xl font-bold text-slate-900">
                      {ORG.currencySymbol}
                    </span>
                    <span className="text-5xl font-bold leading-none text-slate-900">
                      {Number(plan.price).toLocaleString("en-IN")}
                    </span>
                    <span className="mt-auto mb-1 text-sm text-slate-500">
                      {cadenceLabel(plan.billingCycle)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

                  <div className="mt-5">
                    {owned ? (
                      <Button text="Current plan" width="100%" disabled />
                    ) : (
                      <Button
                        text="Get this plan"
                        width="100%"
                        handler={() => handleGetPlan(plan)}
                        loading={pendingPlanId === plan.id}
                      />
                    )}
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Included magazines
                    </p>
                    <ul className="mt-4 space-y-3">
                      {featuresOf(plan).map((feature, k) => (
                        <li
                          key={k}
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
            );
          })}
        </div>
      )}
    </section>
  );
}
