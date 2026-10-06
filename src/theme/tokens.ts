/**
 * Design Tokens for Clean Lane: "Everyday Circularity"
 * Visual direction: Optimistic, dependable, local and quietly premium.
 */

export const TOKENS = {
  brand: {
    primary: '#124B3A', // Deep forest green
    primaryHover: '#0D382B',
    accent: '#CBEA70', // Fresh lime
    accentHover: '#BAE256',
    accentLight: '#F3F9E2',
    supporting: '#147D79', // Clear teal
    supportingLight: '#E8F5F4'
  },
  surface: {
    page: '#F8F7F1', // Soft ivory
    card: '#FFFFFF',
    highlight: '#F2F7E9', // Warm lime wash
    border: '#E8E5DA', // Muted warm border
    borderSubtle: '#F0EEE6'
  },
  text: {
    primary: '#172521', // Deep charcoal
    secondary: '#53625C', // Warm slate
    muted: '#879690',
    onPrimary: '#FFFFFF',
    onAccent: '#172521'
  },
  status: {
    requested: '#147D79', // Clear teal
    confirmed: '#124B3A', // Deep forest
    collected: '#124B3A',
    quantityChecked: '#0F6550',
    pending: '#B46A14', // Warm amber
    attention: '#B45309',
    error: '#BE123C' // Crimson
  }
} as const;
