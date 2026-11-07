import React from 'react';
import type { MaterialCategory } from '../types';

/**
 * One colour + one shape per material stream, used everywhere a material
 * appears (booking chips, journey stops, charts, collector scale, stage map).
 * The shape carries the meaning on its own, so the system works for
 * colour-blind users and in greyscale print.
 */
export type MaterialShape = 'drop' | 'circle' | 'square' | 'hexagon' | 'wave' | 'triangle';

export interface MaterialToken {
  id: MaterialCategory;
  en: string;
  bn: string;
  color: string;
  tint: string;
  shape: MaterialShape;
  /**
   * Approximate count of everyday items per kg (typical unit weights), used for
   * "picture your impact" copy. Indicative only.
   */
  itemsPerKg: number;
  itemEn: string;
  itemBn: string;
}

export const MATERIALS: Record<MaterialCategory, MaterialToken> = {
  PET_BOTTLES: { id: 'PET_BOTTLES', en: 'Plastic bottles', bn: 'প্লাস্টিক বোতল', color: '#1E7FD8', tint: '#E3F0FC', shape: 'drop', itemsPerKg: 40, itemEn: 'half-litre bottles', itemBn: 'আধা লিটারের বোতল' },
  HDPE_RIGID: { id: 'HDPE_RIGID', en: 'Hard plastic', bn: 'শক্ত প্লাস্টিক', color: '#16A06B', tint: '#E1F5EC', shape: 'circle', itemsPerKg: 25, itemEn: 'shampoo bottles', itemBn: 'শ্যাম্পুর বোতল' },
  CARDBOARD_OCC: { id: 'CARDBOARD_OCC', en: 'Cardboard', bn: 'কার্ডবোর্ড', color: '#B9772B', tint: '#F6EBDD', shape: 'square', itemsPerKg: 3, itemEn: 'delivery boxes', itemBn: 'ডেলিভারি বাক্স' },
  ALUMINUM_CANS: { id: 'ALUMINUM_CANS', en: 'Cans', bn: 'ক্যান', color: '#7A6FD6', tint: '#EEECFB', shape: 'hexagon', itemsPerKg: 65, itemEn: 'drink cans', itemBn: 'পানীয়ের ক্যান' },
  LDPE_FILM: { id: 'LDPE_FILM', en: 'Soft plastic', bn: 'নরম প্লাস্টিক', color: '#E0567A', tint: '#FCE7ED', shape: 'wave', itemsPerKg: 120, itemEn: 'carrier bags', itemBn: 'পলিব্যাগ' },
  TETRAPAK_BEVERAGE: { id: 'TETRAPAK_BEVERAGE', en: 'Drink cartons', bn: 'জুসের প্যাকেট', color: '#E3A21A', tint: '#FCF2DC', shape: 'triangle', itemsPerKg: 35, itemEn: 'juice cartons', itemBn: 'জুসের প্যাকেট' }
};

export const MATERIAL_LIST = Object.values(MATERIALS);

const SHAPE_PATHS: Record<MaterialShape, React.ReactNode> = {
  drop: <path d="M12 2.5C12 2.5 5 10.2 5 14.6A7 7 0 0 0 19 14.6C19 10.2 12 2.5 12 2.5Z" />,
  circle: <circle cx="12" cy="12" r="8.5" />,
  square: <rect x="4" y="4" width="16" height="16" rx="3" />,
  hexagon: <path d="M12 2.8 20 7.4V16.6L12 21.2 4 16.6V7.4Z" />,
  wave: <path d="M3 9.5C6 6 9 6 12 9.5S18 13 21 9.5V16C18 19.5 15 19.5 12 16S6 12.5 3 16Z" />,
  triangle: <path d="M12 3.5 21 19.5H3Z" />
};

export interface MaterialGlyphProps {
  material: MaterialCategory;
  size?: number;
  /** 'solid' for chips and pins, 'outline' for quiet contexts. */
  variant?: 'solid' | 'outline';
  className?: string;
  title?: string;
}

/** The material's shape in its colour. Decorative unless `title` is given. */
export const MaterialGlyph: React.FC<MaterialGlyphProps> = ({ material, size = 20, variant = 'solid', className, title }) => {
  const t = MATERIALS[material];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={variant === 'solid' ? t.color : 'none'}
      stroke={t.color}
      strokeWidth={variant === 'solid' ? 0 : 2}
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {SHAPE_PATHS[t.shape]}
    </svg>
  );
};

/** "8.2 kg of plastic bottles ≈ 330 half-litre bottles" */
export const relatableCount = (material: MaterialCategory, kg: number) => Math.round(kg * MATERIALS[material].itemsPerKg);
