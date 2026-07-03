export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-espresso">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-espresso/50 dark:text-cream/50 font-medium">Loading...</p>
      </div>
    </div>
  );
}
