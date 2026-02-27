import Modal from '@/componets/ui/modal';
import { ORG } from '@/config/constants';

function Field({ label, value }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="text-sm text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
        {value || '—'}
      </div>
    </div>
  );
}

export default function PaymentFailedModal({ open, payment, onClose, onRetry }) {
  if (!payment) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Failed</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Payment Failed</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The payment has been failed, you can retry and if still facing a problem contact support.
              </p>
            </div>
          </div>
        </div>

        <Field label="Payment ID" value={`#${payment.id.replace('pay_', '')}`} />
        <Field label="Influencer User name *" value={payment.userName} />
        <Field label="Magazine" value={payment.magazineTitle} />
        <Field label="Amount" value={`${ORG.currencySymbol}${payment.amount}`} />
        <Field label="Tax" value={`${ORG.currencySymbol}${payment.tax}`} />
        <Field label="Net Amount" value={`${ORG.currencySymbol}${payment.netAmount}`} />

        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 mt-4"
        >
          Retry
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Trouble in getting refund{' '}
          <span className="font-medium text-slate-900">Connect Support</span>
        </p>
      </div>
    </Modal>
  );
}
