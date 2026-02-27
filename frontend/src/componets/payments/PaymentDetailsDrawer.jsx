import Drawer from '@/componets/ui/drawer';
import { ORG } from '@/config/constants';

function Field({ label, value }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="text-sm font-medium text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
        {value || '—'}
      </div>
    </div>
  );
}

export default function PaymentDetailsDrawer({
  open,
  payment,
  onClose,
  onInitiateRefund,
  onViewStatus,
}) {
  if (!payment) return null;

  const canRefund = payment.status === 'success';
  const isRefund = payment.status === 'refund';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Payment Details"
      footer={
        <div className="space-y-3">
          {canRefund ? (
            <>
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
              >
                Go Back
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={onInitiateRefund}
                  className="text-sm text-slate-700 underline underline-offset-2"
                >
                  Initiate Refund
                </button>
                <span className="text-xs text-slate-400">
                  Trouble in getting refund{' '}
                  <span className="font-medium text-slate-900">Connect Support</span>
                </span>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onViewStatus ?? onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
              >
                {isRefund ? 'View Status' : 'Go Back'}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-center text-xs text-slate-400">
                Trouble in getting refund{' '}
                <span className="font-medium text-slate-900">Connect Support</span>
              </p>
            </>
          )}
        </div>
      }
    >
      <Field label="Payment ID" value={`#${payment.id.replace('pay_', '')}`} />
      <Field label="User *" value={payment.userName} />
      <Field label="Magazine" value={payment.magazineTitle} />
      <Field label="Amount" value={`${ORG.currencySymbol}${payment.amount}`} />
      <Field label="Tax" value={`${ORG.currencySymbol}${payment.tax}`} />
      <Field label="Net Amount" value={`${ORG.currencySymbol}${payment.netAmount}`} />
    </Drawer>
  );
}
