import Drawer from '@/components/ui/drawer';
import StatusBanner from '@/components/ui/status-banner';
import Button from '@/components/Button.jsx';

/**
 * Confirmation panel shown after a payout request is submitted. Mirrors the
 * "Payout Requested" success screen — a green banner plus a shortcut to the
 * requested-payout status list.
 */
export default function PayoutRequestedDrawer({ open, onClose, onViewStatus }) {
  const footer = (
    <div className="space-y-3">
      <Button text="View Status" handler={onViewStatus} width="100%" />
      <p className="text-center text-xs text-slate-400">
        Trouble withdrawing funds?{' '}
        <button type="button" className="font-semibold text-slate-600 hover:text-slate-900">
          Connect Us
        </button>
      </p>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Payout Requested" footer={footer}>
      <StatusBanner
        variant="success"
        title="Request has been successfully send to the admin."
        description="You will be notified once the admin acts on your request, and you will find the status of the payout in the request list."
      />
    </Drawer>
  );
}
