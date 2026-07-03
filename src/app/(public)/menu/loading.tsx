export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-8 w-48 bg-espresso/5 dark:bg-cream/5 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-espresso/5 dark:bg-cream/5 rounded-lg animate-pulse" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-espresso/5 dark:bg-cream/5 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Menu items skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 overflow-hidden">
              <div className="h-48 bg-espresso/5 dark:bg-cream/5 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-espresso/5 dark:bg-cream/5 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-espresso/5 dark:bg-cream/5 rounded animate-pulse" />
                <div className="h-8 w-20 bg-espresso/5 dark:bg-cream/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
