import { useState } from "react";
import { ORG } from "@/config/constants";
import StatusBadge from "@/components/ui/status-badge";
import { PlusIcon, FileTextIcon } from "@/components/ui/icons";
import { SectionHeader, SquareCheck } from "./parts";

/**
 * Settings ▸ Billings — plan selection, saved payment methods and the past
 * payments table. See design/user - settings - 3.png.
 */
const PLANS = [0, 1, 2];
const METHODS = [{ id: 1 }, { id: 2 }];
const PAYMENTS = [
  { id: "007", date: "Dec 1, 2025" },
  { id: "006", date: "Nov 1, 2025" },
  { id: "005", date: "Oct 1, 2025" },
  { id: "004", date: "Sep 1, 2025" },
];

function GPayBadge() {
  return (
    <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] font-semibold">
      <span className="text-[#4285F4]">G</span>
      <span className="text-slate-700">Pay</span>
    </span>
  );
}

export default function BillingsPanel() {
  const [plan, setPlan] = useState(0);
  const [method, setMethod] = useState(0);

  return (
    <div className="space-y-12">
      {/* Billing cycle */}
      <section>
        <SectionHeader
          title="Billing Cycle"
          subtitle="List of all the magazines you been looking for"
        />
        <div className="space-y-4">
          {PLANS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPlan(i)}
              className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                plan === i
                  ? "border-slate-400 ring-1 ring-slate-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">Basic plan</span>{" "}
                  {ORG.currencySymbol}100/month
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Includes up to 10 users, 20 GB individual data and access to
                  all features.
                </p>
              </div>
              <SquareCheck checked={plan === i} onChange={() => setPlan(i)} />
            </button>
          ))}
        </div>
      </section>

      {/* Payment methods */}
      <section>
        <SectionHeader
          title="Payment Method"
          subtitle="List of all the magazines you been looking for"
        />
        <div className="space-y-4">
          {METHODS.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
                method === i
                  ? "border-slate-400 ring-1 ring-slate-300"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <GPayBadge />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Visa Ending with 5674
                  </p>
                  <p className="text-xs text-slate-500">Expiry 20/83</p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setMethod(i)}
                      className="font-semibold text-slate-700 hover:underline"
                    >
                      Set Default
                    </button>
                    <button
                      type="button"
                      className="text-slate-500 hover:underline"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
              <SquareCheck checked={method === i} onChange={() => setMethod(i)} />
            </div>
          ))}

          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <PlusIcon className="h-4 w-4" /> Add Payment Method
          </button>
        </div>
      </section>

      {/* Past payments */}
      <section>
        <SectionHeader
          title="Past Payments"
          subtitle="List of all the magazines you been looking for"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-3 pr-4 font-medium">Invoice</th>
                <th className="py-3 pr-4 font-medium">Billing date</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYMENTS.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2 text-slate-700">
                      <FileTextIcon className="h-4 w-4 text-red-500" />
                      Invoice #{p.id} –...
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{p.date}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status="paid" />
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {ORG.currencySymbol}100
                  </td>
                  <td className="py-3 pr-4 text-slate-600">Basic plan</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
