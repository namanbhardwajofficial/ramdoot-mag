import Modal from '@/componets/ui/modal';
import StatusBanner from '@/componets/ui/status-banner';

export default function EditSuccessModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5">Edit Magazine</h2>

        <StatusBanner
          variant="success"
          title="Successfully Updated"
          description="The Magazine has been updated and users will able to see new version."
        />

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 mt-4"
        >
          Go Home
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Modal>
  );
}
