import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <div className="text-center max-w-md" role="alert">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-espresso/5 dark:bg-cream/5 flex items-center justify-center">
          <span className="text-4xl" aria-hidden="true">🔍</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream mb-2">
          404
        </h1>
        <h2 className="font-heading text-xl font-semibold text-espresso dark:text-cream mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-smoke-300 dark:text-cream/50 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:ring-offset-2 focus:ring-offset-cream dark:focus:ring-offset-espresso"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
