export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-caramel/20 border-t-caramel animate-spin mx-auto" />
        </div>
        <p className="mt-4 text-sm text-smoke-300 dark:text-cream/50">Loading admin dashboard...</p>
      </div>
    </div>
  );
}
