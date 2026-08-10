import { Link } from "react-router";
import Logo from "@/components/Logo.jsx";

/** Catch-all 404 for unknown routes. */
export default function NotFound() {
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] p-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="text-6xl font-bold text-slate-900">404</p>
        <h1 className="mt-3 text-xl font-medium text-slate-800">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go home
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
