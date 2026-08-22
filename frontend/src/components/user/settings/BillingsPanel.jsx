import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ORG } from "@/config/constants";
import StatusBadge from "@/components/ui/status-badge";
import { FileTextIcon } from "@/components/ui/icons";
import { SectionHeader } from "./parts";
import { subscriptionsApi, paymentsApi, listOf, lc } from "@/lib/api";

/**
 * Settings ▸ Billings — the user's current plan and their real payment
 * history. See design/user - settings - 3.png.
 *
 * There is deliberately no saved-payment-methods section: cards live with
 * Razorpay, and the backend exposes no card vault, so the only honest thing we
 * can show is the method recorded on each past payment.
 *
 * Changing plan happens on /user/subscriptions (that page runs the Razorpay
 * checkout), so this panel links there rather than duplicating a selector.
 */

const CYCLE = { MONTHLY: "month", QUARTERLY: "quarter", YEARLY: "year" };

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(amount) {
  return `${ORG.currencySymbol}${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function CurrentPlan({ sub }) {
  const plan = sub.plan || {};
  const cycle = CYCLE[String(plan.billingCycle || "").toUpperCase()];
  const included = (plan.magazines || [])
    .map((m) => m.magazine?.title)
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-300 p-4 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-800">
            <span className="font-semibold">{plan.name || "Subscription"}</span>{" "}
            {money(plan.price)}
            {cycle ? `/${cycle}` : ""}
          </p>
          {plan.description && (
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          )}
        </div>
        <StatusBadge status={lc(sub.status) || "active"} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-400">Started</dt>
          <dd className="text-slate-700">{formatDate(sub.startDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Renews</dt>
          <dd className="text-slate-700">{formatDate(sub.renewalDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Ends</dt>
          <dd className="text-slate-700">{formatDate(sub.endDate)}</dd>
        </div>
      </dl>

      {included.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">Included magazines</p>
          <p className="mt-1 text-sm text-slate-600">{included.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default function BillingsPanel() {
  const [subs, setSubs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      subscriptionsApi
        .mine()
        .then((res) => {
          if (alive) setSubs(listOf(res));
        })
        .catch((err) => console.warn("mine", err.message)),
      paymentsApi
        .mine()
        .then((res) => {
          if (alive) setPayments(listOf(res));
        })
        .catch((err) => console.warn("payments", err.message)),
    ]).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const active =
    subs.find((s) => String(s.status || "").toUpperCase() === "ACTIVE") || null;

  if (loading) {
    return <p className="text-sm text-slate-400">Loading billing details…</p>;
  }

  return (
    <div className="space-y-12">
      {/* Current plan */}
      <section>
        <SectionHeader
          title="Billing Cycle"
          subtitle="Your current subscription and renewal dates"
        />
        {active ? (
          <div className="space-y-4">
            <CurrentPlan sub={active} />
            <Link
              to="/user/subscriptions"
              className="inline-block text-sm font-medium text-slate-700 hover:underline"
            >
              Change plan
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              You don&apos;t have an active subscription.
            </p>
            <Link
              to="/user/subscriptions"
              className="mt-2 inline-block text-sm font-medium text-slate-700 hover:underline"
            >
              Browse subscription plans
            </Link>
          </div>
        )}
      </section>

      {/* Past payments */}
      <section>
        <SectionHeader
          title="Past Payments"
          subtitle="Every payment recorded on your account"
        />
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-3 pr-4 font-medium">Payment</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-slate-700">
                        <FileTextIcon className="h-4 w-4 text-red-500" />
                        {p.description || "Payment"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={lc(p.status)} />
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {money(p.amount)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {p.paymentMethod || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
