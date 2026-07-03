'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Users,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/lib/admin-store';
import { reservationStatusConfig, type AdminReservation, type AdminReservationStatus } from '@/data/admin-data';
import { staggerContainer, fadeUp } from '@/lib/animations';

const statusFilters: (AdminReservationStatus | 'all')[] = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];

export function ReservationsTab() {
  const {
    reservations,
    reservationFilter,
    setReservationFilter,
    searchQuery,
    updateReservationStatus,
    assignTable,
    getFilteredReservations,
  } = useAdminStore();

  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);

  const filteredReservations = getFilteredReservations();

  const statusCounts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
  };

  const todayReservations = reservations.filter((r) => r.date === '2026-06-25' && r.status !== 'cancelled');
  const totalGuests = todayReservations.reduce((sum, r) => sum + r.guests, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Today&apos;s Bookings</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{todayReservations.length}</p>
        </div>
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Total Guests Tonight</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{totalGuests}</p>
        </div>
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Pending Confirmations</p>
          <p className="text-2xl font-heading font-bold text-caramel">{statusCounts.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((status) => {
          const isActive = reservationFilter === status;
          const config = status === 'all' ? null : reservationStatusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setReservationFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-caramel text-espresso shadow-sm'
                  : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
              }`}
            >
              {status === 'all' ? 'All' : config?.label}
              <span className="ml-1.5 text-[10px] opacity-70">{statusCounts[status]}</span>
            </button>
          );
        })}
      </div>

      {/* Reservations List */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
        {filteredReservations.map((reservation) => {
          const status = reservationStatusConfig[reservation.status];
          return (
            <motion.div
              key={reservation.id}
              variants={fadeUp}
              onClick={() => setSelectedReservation(reservation)}
              className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4 cursor-pointer hover:shadow-lg hover:border-caramel/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
                    <CalendarDays size={18} className="text-caramel" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-espresso dark:text-cream">{reservation.name}</p>
                    <p className="text-xs text-smoke-300 dark:text-cream/40">{reservation.email}</p>
                  </div>
                </div>
                <StatusBadge label={status.label} color={status.color} bg={status.bg} />
              </div>

              <div className="flex items-center gap-6 text-sm text-smoke-300 dark:text-cream/40">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  <span>{new Date(reservation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{reservation.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{reservation.guests} guests</span>
                </div>
                {reservation.tableNumber && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>Table {reservation.tableNumber}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
          <p className="text-sm text-smoke-300 dark:text-cream/40">No reservations found</p>
        </div>
      )}

      {/* Reservation Detail Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-espresso/10 dark:border-cream/10">
                <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">Reservation Details</h3>
                <button onClick={() => setSelectedReservation(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center py-4">
                  <p className="font-heading font-semibold text-xl text-espresso dark:text-cream mb-1">{selectedReservation.name}</p>
                  <p className="text-sm text-smoke-300 dark:text-cream/40">{selectedReservation.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <CalendarDays size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-sm font-medium text-espresso dark:text-cream">
                      {new Date(selectedReservation.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <Clock size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-sm font-medium text-espresso dark:text-cream">{selectedReservation.time}</p>
                  </div>
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <Users size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-sm font-medium text-espresso dark:text-cream">{selectedReservation.guests} guests</p>
                  </div>
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <MapPin size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-sm font-medium text-espresso dark:text-cream">
                      {selectedReservation.tableNumber ? `Table ${selectedReservation.tableNumber}` : 'Unassigned'}
                    </p>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                    <p className="text-xs font-medium text-amber-600 mb-1">Notes</p>
                    <p className="text-sm text-espresso dark:text-cream">{selectedReservation.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {selectedReservation.status === 'pending' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Assign Table</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((table) => (
                            <button
                              key={table}
                              onClick={() => {
                                assignTable(selectedReservation.id, table);
                                setSelectedReservation({ ...selectedReservation, tableNumber: table, status: 'confirmed' });
                              }}
                              className="w-9 h-9 rounded-lg border border-espresso/10 dark:border-cream/10 text-xs font-medium text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel transition-colors"
                            >
                              {table}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle size={14} />}
                          onClick={() => {
                            updateReservationStatus(selectedReservation.id, 'confirmed');
                            setSelectedReservation({ ...selectedReservation, status: 'confirmed' });
                          }}
                          className="flex-1"
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<XCircle size={14} />}
                          onClick={() => {
                            updateReservationStatus(selectedReservation.id, 'cancelled');
                            setSelectedReservation({ ...selectedReservation, status: 'cancelled' });
                          }}
                          className="flex-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedReservation.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        onClick={() => {
                          updateReservationStatus(selectedReservation.id, 'completed');
                          setSelectedReservation({ ...selectedReservation, status: 'completed' });
                        }}
                        className="flex-1"
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<XCircle size={14} />}
                        onClick={() => {
                          updateReservationStatus(selectedReservation.id, 'cancelled');
                          setSelectedReservation({ ...selectedReservation, status: 'cancelled' });
                        }}
                        className="flex-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
