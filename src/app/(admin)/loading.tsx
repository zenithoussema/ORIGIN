'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-espresso" role="status" aria-label="Loading admin panel">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-caramel" />
        <p className="mt-3 text-sm text-smoke-300 dark:text-cream/50">Loading admin panel...</p>
      </motion.div>
    </div>
  );
}
