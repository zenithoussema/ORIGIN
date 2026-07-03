export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-caramel/20 border-t-caramel animate-spin mx-auto" />
        </div>
        <p className="mt-4 text-sm text-smoke-300 dark:text-cream/50">Loading...</p>
      </div>
    </div>
  );
}
