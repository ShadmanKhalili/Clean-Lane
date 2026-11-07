import type { UserRole } from './types';

/**
 * Minimal URL routing: `?as=<role>&view=<view>`.
 * Query params (not paths) keep Netlify/static hosting trivial and make every
 * screen of the demo linkable, refresh-safe and back-button friendly.
 */
export const USER_ROLES: readonly UserRole[] = [
  'customer_household',
  'customer_apartment',
  'customer_business',
  'collector',
  'aggregator',
  'processor',
  'operator',
  'brand_partner'
] as const;

export const CUSTOMER_VIEWS = ['overview', 'rewards', 'activity'] as const;
export const STAFF_VIEWS = ['overview', 'traceability'] as const;
export const SHARED_VIEWS = ['evidence_model'] as const;

export type AppView =
  | (typeof CUSTOMER_VIEWS)[number]
  | (typeof STAFF_VIEWS)[number]
  | (typeof SHARED_VIEWS)[number];

export const isCustomerRole = (role: UserRole) => role.startsWith('customer');

export const isRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

/** A view is only valid for the roles that have a navigation entry for it. */
export const isViewAllowed = (role: UserRole, view: string): view is AppView => {
  if ((SHARED_VIEWS as readonly string[]).includes(view)) return true;
  const allowed: readonly string[] = isCustomerRole(role) ? CUSTOMER_VIEWS : STAFF_VIEWS;
  return allowed.includes(view);
};

export const normaliseView = (role: UserRole, view: string | null | undefined): AppView =>
  view && isViewAllowed(role, view) ? view : 'overview';

export interface RouteState {
  role: UserRole | null;
  view: string | null;
}

export const readRoute = (search: string = window.location.search): RouteState => {
  const params = new URLSearchParams(search);
  const as = params.get('as');
  return { role: isRole(as) ? as : null, view: params.get('view') };
};

export const buildSearch = (role: UserRole, view: AppView): string => {
  const params = new URLSearchParams(window.location.search);
  params.set('as', role);
  if (view === 'overview') params.delete('view');
  else params.set('view', view);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};
