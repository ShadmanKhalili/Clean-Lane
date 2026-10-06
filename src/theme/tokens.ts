/**
 * Design Tokens for Clean Lane: "Bright, Human, Trustworthy" Redesign
 * Visual Direction: Deep Indigo, Cream, Mint, Marigold, Ink, Slate
 */

export const TOKENS = {
  brand: {
    signature: '#25345C', // Deep Indigo (Logo, primary buttons, key headings)
    signatureHover: '#1B2644',
    signatureLight: '#EDF1F9',
    mint: '#C9F1DC', // Fresh Mint (Service illustrations, light highlights)
    mintDark: '#12613F', // For readable text on mint
    mintLight: '#E8FAF1',
    marigold: '#F5BF55', // Reward Marigold (Points, celebration)
    marigoldDark: '#7A4D00',
    marigoldLight: '#FEF8EB'
  },
  surface: {
    canvas: '#FFF9F0', // Warm Cream (Main app background)
    card: '#FFFFFF', // Secondary surface (Forms, cards)
    cardSubtle: '#FAF5EC',
    border: '#EDE4D8', // Soft warm border
    borderSubtle: '#F5EFE6'
  },
  text: {
    ink: '#202B38', // Main copy (Ink)
    slate: '#53616D', // Supporting copy (Slate)
    muted: '#8896A4',
    onSignature: '#FFFFFF',
    onMarigold: '#202B38'
  },
  status: {
    requested: '#25345C',
    confirmed: '#25345C',
    collected: '#12613F',
    quantityChecked: '#1B7A53',
    pending: '#C27803',
    attention: '#C25E00',
    error: '#D32F2F'
  },
  motion: {
    tap: 120, // 100-150ms Press & selection feedback
    reveal: 190, // 160-220ms Expand short explanation/reveal field
    navigate: 220, // 180-260ms Move between booking steps
    confirm: 350, // 300-450ms One-time booking or reward confirmation
    status: 200, // 180-250ms Status card update
    easingOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easingIn: 'cubic-bezier(0.7, 0, 0.84, 0)'
  }
} as const;
