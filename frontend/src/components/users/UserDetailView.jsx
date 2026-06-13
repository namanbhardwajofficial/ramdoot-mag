import { useState } from 'react';
import StatusBadge from '@/components/ui/status-badge';
import { EyeIcon } from '@/components/ui/icons';

const TABS = { BASIC: 'basic', MAGAZINES: 'magazines', CREDENTIALS: 'credentials' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function InfoField({ label, value, valueClass = '' }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-sm font-medium text-slate-900 ${valueClass}`}>{value || '—'}</div>
    </div>
  );
}

function BasicInfoTab({ user }) {
  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-64">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Personal Information</h3>
        <InfoField label="Full Name" value={user.name} />
        <InfoField label="Email Address" value={user.email} />
        <InfoField label="Phone Number" value={user.phone} />
        <InfoField label="Location" value={user.location} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-64">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Subscription &amp; Billing</h3>
        <InfoField label="Plan Type" value={user.subscription} />
        <InfoField label="Amount" value={user.amount} />
        <InfoField label="Payment Method" value={user.paymentMethod} />
      </div>
    </div>
  );
}

function MagazinesTab({ user }) {
  const magazines = user.magazines || [];
  return (
    <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs text-slate-400 font-medium px-6 py-3">Magazine Name &amp; ID</th>
            <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Status</th>
            <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Published On</th>
            <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Purchased On</th>
            <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Reads / Views</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {magazines.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-slate-400 py-10">No magazines found</td>
            </tr>
          ) : magazines.map((mag, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-800">{mag.name}</div>
                <div className="text-xs text-slate-400">#{mag.id}</div>
              </td>
              <td className="px-4 py-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {mag.status}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-600">{formatDate(mag.publishedOn)}</td>
              <td className="px-4 py-4 text-slate-600">{formatDate(mag.purchasedOn)}</td>
              <td className="px-4 py-4 text-slate-600">{mag.reads?.toLocaleString('en-IN') ?? '—'}</td>
              <td className="px-4 py-4">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100">
                  <EyeIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CredentialsTab({ user }) {
  const google = user.connectedAccounts?.google;
  const apple = user.connectedAccounts?.apple;
  const facebook = user.connectedAccounts?.facebook;
  const twoFAStatus = user.twoFA?.status;

  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-48">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Login Credentials</h3>
        <InfoField label="Email Address" value={user.email} />
        <InfoField label="Password" value="●●●●●●●●●●●● (hashed)" />
        <InfoField label="Account ID" value={`#${user.id?.replace('user_', '') ?? '—'}`} />
        <InfoField label="Account Created" value={formatDate(user.joinedOn)} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-48">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">2FA &amp; Security</h3>
        <InfoField
          label="2FA Status"
          value={twoFAStatus ?? 'Not enabled'}
          valueClass={twoFAStatus ? 'text-emerald-600' : 'text-slate-400'}
        />
        <InfoField label="Backup Email" value={user.twoFA?.backupEmail} />
        <InfoField label="Last Login" value={user.lastLogin} />
        <InfoField
          label="Failed Login Attempts"
          value={user.failedAttempts ?? '0 in last 30 days'}
          valueClass="text-emerald-600"
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-48">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Connected Accounts</h3>
        <InfoField
          label="Google"
          value={google ? `Connected — ${google}` : 'Not connected'}
          valueClass={google ? 'text-emerald-600' : 'text-slate-400'}
        />
        <InfoField
          label="Apple ID"
          value={apple ? `Connected — ${apple}` : 'Not connected'}
          valueClass={apple ? 'text-emerald-600' : 'text-slate-400'}
        />
        <InfoField
          label="Facebook"
          value={facebook ? `Connected — ${facebook}` : 'Not connected'}
          valueClass={facebook ? 'text-emerald-600' : 'text-slate-400'}
        />
      </div>
    </div>
  );
}

export default function UserDetailView({ user, onBack, onEdit }) {
  const [tab, setTab] = useState(TABS.BASIC);
  const initials = getInitials(user.name);

  return (
    <>
      {/* User Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 select-none">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <StatusBadge status={user.status} />
            </div>
            <div className="text-sm text-slate-400 mb-1">#{user.id?.replace('user_', '') ?? user.id}</div>
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
              {user.location && <span>{user.location}</span>}
            </div>
          </div>
        </div>
        <button onClick={onEdit} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shrink-0">
          Edit User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-0">
        {[
          { key: TABS.BASIC, label: 'Basic Info' },
          { key: TABS.MAGAZINES, label: 'Magazines' },
          { key: TABS.CREDENTIALS, label: 'Credentials' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === TABS.BASIC && <BasicInfoTab user={user} />}
      {tab === TABS.MAGAZINES && <MagazinesTab user={user} />}
      {tab === TABS.CREDENTIALS && <CredentialsTab user={user} />}
    </>
  );
}
