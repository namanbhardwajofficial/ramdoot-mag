/**
 * Inline "this failed to load" block with a retry action.
 *
 * Used for data that loads on mount. A toast is wrong there — it fires before
 * the user has done anything, and it disappears, leaving an empty screen with
 * no explanation. This stays put and offers a way out.
 *
 * `message` should be the API's own message; the client already turns error
 * envelopes into readable text (validation details are joined, and network
 * failures say the server is unreachable).
 */
export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-100 bg-red-50/60 px-5 py-8 text-center ${className}`}
    >
      <p className="text-sm font-medium text-red-700">Couldn&apos;t load this</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-red-600/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}
