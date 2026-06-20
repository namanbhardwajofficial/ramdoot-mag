import Button from "@/components/Button.jsx";
import { ORG } from "@/config/constants";
import { CheckCircleIcon } from "@/components/ui/icons";
import { toastSuccess } from "@/lib/confirm";

/**
 * Subscription plans page — a hero panel with the featured plan card floating
 * over its right edge. See design/User - subscriptions.png.
 */
const PLAN = {
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

export default function Subscriptions() {
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
          {PLAN.badge}
        </div>

        <div className="p-6">
          <p className="text-sm font-medium text-slate-700">{PLAN.name}</p>

          <div className="mt-2 flex items-start gap-1">
            <span className="mt-1 text-2xl font-bold text-slate-900">
              {ORG.currencySymbol}
            </span>
            <span className="text-5xl font-bold leading-none text-slate-900">
              {PLAN.price}
            </span>
            <span className="mt-auto mb-1 text-sm text-slate-500">
              {PLAN.cadence}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">{PLAN.tagline}</p>

          <div className="mt-5">
            <Button
              text="Get this plan"
              width="100%"
              handler={() => toastSuccess("Checkout coming soon")}
            />
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
              {PLAN.features.map((feature, i) => (
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
