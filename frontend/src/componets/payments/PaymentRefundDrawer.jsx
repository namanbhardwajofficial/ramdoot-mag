import Drawer from '@/componets/ui/drawer';
import StepProgress from '@/componets/ui/step-progress';

const REFUND_STEPS = [
  { title: 'Payment refund requested', description: 'Please provide your name and email' },
  { title: 'Funds transferring initiation', description: 'A few details about your company' },
  { title: 'Funds refunded', description: 'Share posts to your social accounts' },
];

export default function PaymentRefundDrawer({ open, onClose, currentStep = 1 }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Payment Refund"
      footer={
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
          >
            Go Back
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
      <StepProgress steps={REFUND_STEPS} currentStep={currentStep} />
    </Drawer>
  );
}
