import { useMemo, useState } from "react";

const ORG = {
  currencySymbol: "₹",
};

const SUBSCRIPTION_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CANCELLED: "cancelled",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const dummyPlans = [
  {
    id: "plan_basic",
    label: "Basic",
    priceInPaise: 49900,
    type: "Monthly",
  },
  {
    id: "plan_pro",
    label: "Pro",
    priceInPaise: 99900,
    type: "Monthly",
  },
  {
    id: "plan_enterprise",
    label: "Enterprise",
    priceInPaise: 249900,
    type: "Yearly",
  },
];

const dummySubscriptions = [
  {
    id: "sub_1001",
    status: "active",
    price: 499,
    type: "Basic Monthly",
    createdBy: "admin",
    updatedAt: "2026-06-10",
  },
  {
    id: "sub_1002",
    status: "inactive",
    price: 999,
    type: "Pro Monthly",
    createdBy: "kapil",
    updatedAt: "2026-06-12",
  },
  {
    id: "sub_1003",
    status: "cancelled",
    price: 2499,
    type: "Enterprise Yearly",
    createdBy: "manager",
    updatedAt: "2026-06-15",
  },
];

function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 min-w-55 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-slate-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function AddSubscriptionModal({ plans, onClose, onSubmit }) {
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [createdBy, setCreatedBy] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!planId || !createdBy.trim()) return;

    onSubmit({
      planId,
      createdBy,
    });
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Subscription</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.label} — {ORG.currencySymbol}
                {(plan.priceInPaise / 100).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Created By</label>
          <input
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            placeholder="Name"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!planId}
            className="px-4 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Subscriptions() {
  const [plans] = useState(dummyPlans);
  const [subscriptions, setSubscriptions] = useState(dummySubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    return {
      activeSubscribers: subscriptions.filter((s) => s.status === "active")
        .length,
      newSubscriptions: subscriptions.length,
      cancellations: subscriptions.filter((s) => s.status === "cancelled")
        .length,
    };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchStatus = statusFilter ? sub.status === statusFilter : true;

      const searchText = search.toLowerCase();
      const matchSearch =
        sub.id.toLowerCase().includes(searchText) ||
        sub.type.toLowerCase().includes(searchText) ||
        sub.createdBy.toLowerCase().includes(searchText);

      return matchStatus && matchSearch;
    });
  }, [subscriptions, search, statusFilter]);

  function handleCreate(form) {
    const selectedPlan = plans.find((p) => p.id === form.planId);

    if (!selectedPlan) return;

    const newSubscription = {
      id: `sub_${Date.now()}`,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      price: selectedPlan.priceInPaise / 100,
      type: `${selectedPlan.label} ${selectedPlan.type}`,
      createdBy: form.createdBy,
      updatedAt: new Date().toISOString(),
    };

    setSubscriptions((prev) => [newSubscription, ...prev]);
    setShowModal(false);
  }

  function handleDelete(id) {
    const confirm = window.confirm(
      "This subscription will be permanently deleted."
    );

    if (!confirm) return;

    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  }

  function handleToggle(row) {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === row.id
          ? {
              ...sub,
              status:
                sub.status === SUBSCRIPTION_STATUSES.ACTIVE
                  ? SUBSCRIPTION_STATUSES.INACTIVE
                  : SUBSCRIPTION_STATUSES.ACTIVE,
              updatedAt: new Date().toISOString(),
            }
          : sub
      )
    );
  }

  function handleEdit(row) {
    alert(`Edit subscription: ${row.id}`);
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Subscriptions</h1>
          <p className="text-sm text-slate-500">
            Create, update, and manage subscription records
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Add New Subscription
        </button>
      </header>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Active Subscribers" value={stats.activeSubscribers} />
        <StatCard title="New Subscriptions" value={stats.newSubscriptions} />
        <StatCard title="Cancellations" value={stats.cancellations} />
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Subscription List</h2>
            <p className="text-sm text-slate-500">
              View and manage all subscription records
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscription..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Status</option>
            {Object.values(SUBSCRIPTION_STATUSES).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-3 px-3">Subscription ID</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Created/Updated By</th>
                <th className="py-3 px-3">Last Updated</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-slate-500"
                  >
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-3 font-mono text-xs">
                      #{sub.id.replace("sub_", "")}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={sub.status} />
                    </td>

                    <td className="py-3 px-3">
                      {ORG.currencySymbol}
                      {Number(sub.price).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3">{sub.type}</td>

                    <td className="py-3 px-3 text-slate-700">
                      @{sub.createdBy || "—"}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(sub.updatedAt)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(sub)}
                          className="px-2 py-1 rounded-md text-xs border border-slate-300 hover:bg-slate-100"
                        >
                          {sub.status === SUBSCRIPTION_STATUSES.ACTIVE
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() => handleEdit(sub)}
                          className="px-2 py-1 rounded-md text-xs border border-slate-300 hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="px-2 py-1 rounded-md text-xs border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <AddSubscriptionModal
          plans={plans}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}