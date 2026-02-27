import Drawer from '@/componets/ui/drawer';
import StepProgress from '@/componets/ui/step-progress';

const PAYOUT_STEPS = [
  { title: 'Payment request received', description: 'Please provide your name and email' },
  { title: 'Funds transferring initiation', description: 'A few details about your company' },
  { title: 'Funds transferred', description: 'Share posts to your social accounts' },
];

function StatusBanner({ status }) {
  const isSuccess = status === 'success';
  const isProcessing = status === 'processing';

  if (!isSuccess && !isProcessing) return null;

  return (
    <div
      className={`rounded-xl p-4 mb-5 ${
        isSuccess
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-emerald-50 border border-emerald-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">
            {isProcessing ? 'Payment Processing' : 'Payment Successful'}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            The payment has been {isProcessing ? 'fetched' : 'completed'}, you can retry and if
            still facing a problem contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InfluencerPayoutDrawer({
  open,
  payout,
  onClose,
  currentStep = 1,
}) {
  if (!payout) return null;

  const stepFromStatus =
    payout.status === 'success' ? 3 : payout.status === 'processing' ? 1 : 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Influencer Payout"
      footer={
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
          >
            Go Home
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-center text-xs text-slate-400">
            Trouble in getting refund{' '}
            <span className="font-medium text-slate-900">Connect Support</span>
          </p>
        </div>
      }
    >
      <StatusBanner status={payout.status} />
      <StepProgress steps={PAYOUT_STEPS} currentStep={currentStep ?? stepFromStatus} />
    </Drawer>
  );
}
