import { useSearchParams } from "react-router";

/**
 * User Settings shell — a card with the "Settings" title + tab nav down the
 * left and the active panel on the right. The active tab is reflected in the
 * URL (?tab=...) so individual tabs stay deep-linkable.
 * See design/user - settings*.png.
 */
export default function SettingsLayout({ tabs }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab = tabs.find((t) => t.key === requested) ?? tabs[0];
  const active = activeTab.key;

  const setActive = (key) =>
    setSearchParams((prev) => {
      prev.set("tab", key);
      return prev;
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <nav className="border-b border-slate-200 bg-linear-to-b from-slate-50 to-white p-6 lg:border-b-0 lg:border-r">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">Settings</h1>
          <div className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  active === t.key
                    ? "bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70"
                }`}
                aria-current={active === t.key ? "page" : undefined}
              >
                <span className="h-5 w-5 text-slate-400">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        <section className="p-6 lg:p-8">{activeTab.render()}</section>
      </div>
    </div>
  );
}
