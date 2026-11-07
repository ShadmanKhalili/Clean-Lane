import type { CustomerType, UserRole } from '../types';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  customerType: CustomerType;
}

/**
 * The signed-in customer for each customer persona. Previously every action
 * hardcoded Nasreen (CUST-H-801) while new bookings used a different id
 * (CL-CUST-8841), so apartment/business activity credited the wrong account and
 * new pending holds never showed up in the balance.
 */
export const CUSTOMER_PROFILES: Record<'customer_household' | 'customer_apartment' | 'customer_business', CustomerProfile> = {
  customer_household: { id: 'CUST-H-801', name: 'Nasreen Akhter', phone: '+880 1712 345678', customerType: 'household' },
  customer_apartment: { id: 'CUST-APT-402', name: 'Green View Heights Committee', phone: '+880 1819 987654', customerType: 'apartment' },
  customer_business: { id: 'CUST-BIZ-511', name: 'Artisan Roastery & Café', phone: '+880 1911 223344', customerType: 'business' }
};

/** Staff personas preview the household customer experience. */
export const customerForRole = (role: UserRole): CustomerProfile =>
  role in CUSTOMER_PROFILES ? CUSTOMER_PROFILES[role as keyof typeof CUSTOMER_PROFILES] : CUSTOMER_PROFILES.customer_household;
