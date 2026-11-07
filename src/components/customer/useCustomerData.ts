import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Booking, BookingStatus } from '../../types';
import { daysFromToday, parseScheduledDate } from './dates';

/** Statuses of a pickup that has been booked but not yet collected. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['REQUESTED', 'CONFIRMED', 'COLLECTOR_ASSIGNED', 'EN_ROUTE'];
export const COMPLETED_BOOKING_STATUSES: BookingStatus[] = [
  'COLLECTED',
  'QUANTITY_UNDER_REVIEW',
  'QUANTITY_CONFIRMED',
  'ENTERED_RECOVERY_CHAIN',
  'PROCESSED'
];

export const isActiveBooking = (b: Booking) => ACTIVE_BOOKING_STATUSES.includes(b.status);

/** A customer can still cancel until the collector is on the way. */
export const isCancellable = (b: Booking) => b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'COLLECTOR_ASSIGNED';

/**
 * Everything the customer screens need, already scoped to the signed-in customer.
 * (The shared context holds every customer's records.)
 */
export const useCustomerData = () => {
  const { bookings, jobs, pointsLedger, redemptions, complaints, notifications, currentCustomer } = useApp();

  return useMemo(() => {
    const id = currentCustomer.id;
    const myBookings = bookings.filter((b) => b.customerId === id);

    const upcoming = myBookings
      .filter((b) => isActiveBooking(b) && (daysFromToday(b.scheduledDate) ?? 0) >= 0)
      .sort(
        (a, b) =>
          (parseScheduledDate(a.scheduledDate)?.getTime() ?? Infinity) -
          (parseScheduledDate(b.scheduledDate)?.getTime() ?? Infinity)
      );
    const nextBooking: Booking | undefined = upcoming[0];
    const nextJob = nextBooking ? jobs.find((j) => j.bookingId === nextBooking.id) : undefined;
    const attentionBooking = myBookings.find((b) => b.status === 'MISSED' || b.status === 'DISPUTED');

    // Diverted mass: hub-confirmed weight where we have it, otherwise the collector's field weight.
    let confirmedKg = 0;
    let awaitingKg = 0;
    for (const b of myBookings) {
      if (b.status === 'CANCELLED' || b.status === 'MISSED') continue;
      if (b.confirmedWeightKg && b.confirmedWeightKg > 0) confirmedKg += b.confirmedWeightKg;
      else if (b.fieldWeightKg && b.fieldWeightKg > 0) awaitingKg += b.fieldWeightKg;
    }

    return {
      customer: currentCustomer,
      myBookings,
      upcoming,
      nextBooking,
      nextJob,
      attentionBooking,
      confirmedKg,
      awaitingKg,
      myLedger: pointsLedger.filter((e) => e.customerId === id),
      myRedemptions: redemptions.filter((r) => r.customerId === id),
      myComplaints: complaints.filter((c) => c.customerId === id),
      myNotifications: notifications.filter((n) => n.customerId === id)
    };
  }, [bookings, jobs, pointsLedger, redemptions, complaints, notifications, currentCustomer]);
};
