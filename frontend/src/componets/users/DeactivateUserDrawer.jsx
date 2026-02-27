import Drawer from '@/componets/ui/drawer';
import StatusBadge from '@/componets/ui/status-badge';
import { ORG } from '@/config/constants';

function CopyField({ label, value }) {
  function handleCopy() { navigator.clipboard.writeText(value).catch(console.error); }
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-800 truncate">{value}</span>
        <button onClick={handleCopy} className="shrink-0 text-slate-400 hover:text-slate-600">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DeactivateUserDrawer({ open, user, onClose, onDeactivate }) {
  if (!user) return null;

  const ref = user.id.replace('user_', '');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Deactivate User"
      footer={
        <div className="space-y-2">
          <button
            onClick={() => onDeactivate(user.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
          >
            Deactivate Account
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-xs text-center text-slate-400">
            Trouble in deactivate account? <span className="text-slate-700 font-medium underline underline-offset-2 cursor-pointer">Connect Us</span>
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs text-slate-400 mb-1">User Full Name</label>
          <p className="text-sm font-medium text-slate-800">{user.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CopyField label="Email ID" value={user.email} />
          <CopyField label="Phone No" value={user.phone} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CopyField label="User ID" value={`#${ref}`} />
          <div>
            <label className="block text-xs text-slate-400 mb-1">Account Status</label>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Subscription</label>
            <p className="text-sm text-slate-800">Last Paid @ {user.lastPaid}</p>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Subscription Plan</label>
            <p className="text-sm text-slate-800">{user.subscriptionPlan}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Role</label>
            <p className="text-sm text-slate-800">{user.role}</p>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Joined On</label>
            <p className="text-sm text-slate-800">
              {new Date(user.joinedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
