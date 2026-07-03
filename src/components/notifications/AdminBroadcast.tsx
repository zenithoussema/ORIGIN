'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Zap,
  Users,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROMO';

const typeOptions: { value: NotificationType; label: string; icon: typeof Info; color: string }[] = [
  { value: 'INFO', label: 'Information', icon: Info, color: 'text-blue-500' },
  { value: 'SUCCESS', label: 'Success', icon: CheckCircle, color: 'text-sage' },
  { value: 'WARNING', label: 'Warning', icon: AlertTriangle, color: 'text-amber-500' },
  { value: 'ERROR', label: 'Error', icon: AlertCircle, color: 'text-red-500' },
  { value: 'PROMO', label: 'Promotion', icon: Zap, color: 'text-caramel' },
];

interface AdminBroadcastProps {
  onClose?: () => void;
}

export function AdminBroadcast({ onClose }: AdminBroadcastProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('INFO');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = useCallback(async () => {
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || 'Failed to send' });
        return;
      }

      setResult({ success: true, message: data.message });
      setTitle('');
      setMessage('');
      setType('INFO');

      setTimeout(() => {
        setResult(null);
        setIsOpen(false);
      }, 3000);
    } catch {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setIsSending(false);
    }
  }, [title, message, type]);

  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
      >
        <Megaphone size={16} />
        <span className="hidden sm:inline">Broadcast</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/50 dark:bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
                onClose?.();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-caramel/10 flex items-center justify-center">
                    <Megaphone size={20} className="text-caramel" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-espresso dark:text-cream">
                      Broadcast Notification
                    </h2>
                    <p className="text-xs text-smoke-300 dark:text-cream/40">
                      Send to all users
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="p-2 rounded-lg text-smoke-300 dark:text-cream/40 hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Result Message */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`mx-6 mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
                        result.success
                          ? 'bg-sage/10 text-sage'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                      }`}
                    >
                      {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {result.message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <div className="px-6 pb-6 space-y-4">
                {/* Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-2">
                    Notification Type
                  </label>
                  <div className="flex gap-2">
                    {typeOptions.map((opt) => {
                      const isActive = type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-caramel/10 text-caramel ring-1 ring-caramel/30'
                              : 'bg-espresso/5 dark:bg-cream/5 text-smoke-300 dark:text-cream/40 hover:bg-espresso/10 dark:hover:bg-cream/10'
                          }`}
                        >
                          <opt.icon size={12} className={isActive ? opt.color : ''} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title..."
                    className="w-full px-3 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
                    maxLength={200}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Notification message..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all resize-none"
                    maxLength={1000}
                  />
                  <p className="text-[10px] text-smoke-300/40 dark:text-cream/20 mt-1">
                    {message.length}/1000
                  </p>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!title.trim() || !message.trim() || isSending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-caramel py-3 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Broadcast
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-smoke-300/40 dark:text-cream/20">
                  <Users size={10} className="inline mr-1" />
                  This will be sent to all registered users
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
