import { useRouteError, isRouteErrorResponse, Link, useNavigate } from "react-router";

/**
 * Route-level error boundary. Set as `errorElement` so a thrown render error (or
 * a failed lazy chunk) shows a friendly page instead of a blank white screen.
 */
export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error?.message || "An unexpected error occurred.";

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
        <p className="mt-2 break-words text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(0)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Reload
          </button>
          <Link
            to="/"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
