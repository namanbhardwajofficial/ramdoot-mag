import { useState } from 'react';

/**
 * Shared Settings layout: page header + a left sub-nav of tabs and the active
 * tab's panel on the right. Roles pass their own `tabs` so My details / Security
 * stay identical across admin and influencer while role-specific tabs (e.g.
 * influencer Payout) are added per role.
 */
export default function SettingsShell({
  tabs,
  subtitle = 'Manage your profile, security and account preferences',
}) {
  const [active, setActive] = useState(tabs[0].key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="p-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
          <nav className="p-4 bg-slate-50/40 lg:border-r border-slate-200 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  active === t.key
                    ? 'bg-white shadow-sm text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
                aria-current={active === t.key ? 'page' : undefined}
              >
                <span className="w-5 h-5 text-slate-400">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <section className="p-6">{activeTab.render()}</section>
        </div>
      </div>
    </div>
  );
}
