import Modal from '@/componets/ui/modal';
import { useState } from 'react';

export default function PublishSuccessModal({ open, onClose, shareLink }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(shareLink || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-5">Publish Magazine</h2>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-emerald-800">Successfully Magazine Published</p>
          <p className="text-xs text-emerald-600 mt-1">
            The magazine is published, please feel free to share across platforms.
          </p>
        </div>

        <div className="text-left mb-4">
          <label className="block text-sm font-medium mb-1">Share Link</label>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
            <input
              readOnly
              value={shareLink || ''}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-slate-500 hover:text-slate-700 border-l border-slate-300"
            >
              {copied ? (
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
