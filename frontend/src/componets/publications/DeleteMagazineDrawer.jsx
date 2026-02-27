import { useState } from 'react';
import Drawer from '@/componets/ui/drawer';
import StatusBanner from '@/componets/ui/status-banner';

export default function DeleteMagazineDrawer({ open, publication, onClose, onDelete }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [deleted, setDeleted] = useState(false);

  function handleDelete() {
    onDelete({ reason, note });
    setDeleted(true);
  }

  function handleClose() {
    setDeleted(false);
    setReason('');
    setNote('');
    onClose();
  }

  if (!publication) return null;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={deleted ? 'Magazine Details' : 'Delete Magazine'}
      footer={
        <button
          onClick={deleted ? handleClose : handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
        >
          {deleted ? 'Go Home' : 'Delete Magazine'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      }
    >
      {deleted ? (
        <StatusBanner
          variant="success"
          title="Successfully Deactivated"
          description="Deactivate the current magazine for all subscriber."
        />
      ) : (
        <>
          <StatusBanner
            variant="warning"
            title="Important Notice"
            description="This action cannot be reversed."
          />

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Please Note</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deactivating this pricing will make the magazine unavailable for new
              purchases and subscriptions. Existing subscribers will continue to have
              access until their current subscription period ends.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              This action does not delete the magazine and can be reversed at any time.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reason to Deactivate Campaign *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">No Specified</option>
              <option value="performance">Low Performance</option>
              <option value="seasonal">Seasonal End</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a additional note for profile deactivation."
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>
        </>
      )}
    </Drawer>
  );
}
