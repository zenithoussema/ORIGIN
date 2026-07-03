'use client';

import { motion } from 'framer-motion';
import { CalendarDays, Clock, Users, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUserStore } from '@/lib/user-store';
import { reservationStatusConfig } from '@/data/user-profile';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function ReservationsTab() {
  const { reservations, cancelReservation } = useUserStore();

  const upcomingReservations = reservations.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  if (reservations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-12 text-center"
      >
        <CalendarDays size={48} className="mx-auto mb-4 text-smoke-300 dark:text-cream/20" />
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-2">
          No reservations yet
        </h3>
        <p className="text-sm text-smoke-300 dark:text-cream/40 mb-6">
          Book a table for an unforgettable dining experience.
        </p>
        <a href="/reservations">
          <Button variant="primary" leftIcon={<CalendarDays size={16} />}>
            Make a Reservation
          </Button>
        </a>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
            Upcoming
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {upcomingReservations.map((reservation) => {
              const statusInfo = reservationStatusConfig[reservation.status];
              return (
                <motion.div
                  key={reservation.id}
                  variants={fadeUp}
                  className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
                        <CalendarDays size={18} className="text-caramel" />
                      </div>
                      <div>
                        <p className="font-medium text-espresso dark:text-cream">
                          {new Date(reservation.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-smoke-300 dark:text-cream/40">
                          {reservation.name}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={statusInfo.label}
                      color={statusInfo.color}
                      bg={statusInfo.bg}
                    />
                  </div>

                  <div className="flex items-center gap-6 text-sm text-smoke-300 dark:text-cream/40 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{reservation.guests} guests</span>
                    </div>
                  </div>

                  {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<X size={14} />}
                      onClick={() => cancelReservation(reservation.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
            Past Reservations
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {pastReservations.map((reservation) => {
              const statusInfo = reservationStatusConfig[reservation.status];
              return (
                <motion.div
                  key={reservation.id}
                  variants={fadeUp}
                  className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5 opacity-70"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-espresso/5 dark:bg-cream/5 flex items-center justify-center">
                        <CalendarDays size={18} className="text-smoke-300 dark:text-cream/40" />
                      </div>
                      <div>
                        <p className="font-medium text-espresso dark:text-cream">
                          {new Date(reservation.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-smoke-300 dark:text-cream/40">
                          {reservation.time} • {reservation.guests} guests
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={statusInfo.label}
                      color={statusInfo.color}
                      bg={statusInfo.bg}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
