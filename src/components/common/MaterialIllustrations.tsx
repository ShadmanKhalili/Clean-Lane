import React from 'react';

interface MaterialIllustrationProps {
  category: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Coherent, warm, lightly dimensional SVG material illustrations
 * Aligned with Clean Lane Visual Design Brief Section 6
 */
export const MaterialIllustration: React.FC<MaterialIllustrationProps> = ({
  category,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }[size];

  switch (category) {
    case 'PET_BOTTLES':
    case 'plastic_bottles':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Soft shadow */}
            <ellipse cx="32" cy="58" rx="16" ry="3" fill="#EDE4D8" />
            {/* Bottle body */}
            <path
              d="M24 24C24 20.6863 26.6863 18 30 18H34C37.3137 18 40 20.6863 40 24V50C40 53.3137 37.3137 56 34 56H30C26.6863 56 24 53.3137 24 50V24Z"
              fill="#C9F1DC"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Neck */}
            <path
              d="M29 18V12C29 10.8954 29.8954 10 31 10H33C34.1046 10 35 10.8954 35 12V18"
              fill="#C9F1DC"
              stroke="#25345C"
              strokeWidth="2.5"
            />
            {/* Cap */}
            <rect x="28" y="6" width="8" height="5" rx="1.5" fill="#25345C" />
            {/* Label wrap */}
            <rect x="24" y="30" width="16" height="12" fill="#FFFFFF" stroke="#25345C" strokeWidth="2" />
            <line x1="28" y1="36" x2="36" y2="36" stroke="#12613F" strokeWidth="2" strokeLinecap="round" />
            {/* Highlight gleam */}
            <path d="M27 24V48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>
      );

    case 'CARDBOARD_OCC':
    case 'cardboard_boxes':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Soft shadow */}
            <ellipse cx="32" cy="58" rx="20" ry="3.5" fill="#EDE4D8" />
            {/* Main box front */}
            <path
              d="M14 26L32 16L50 26V48L32 58L14 48V26Z"
              fill="#FAF5EC"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Top right flap */}
            <path
              d="M32 16L50 26L32 36L14 26L32 16Z"
              fill="#F5BF55"
              fillOpacity="0.4"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Center crease */}
            <line x1="32" y1="36" x2="32" y2="58" stroke="#25345C" strokeWidth="2.5" />
            {/* Tape strip */}
            <path d="M22 21L42 32" stroke="#25345C" strokeWidth="2.5" strokeLinecap="round" />
            {/* Clean recycle mark badge */}
            <circle cx="23" cy="42" r="4" fill="#C9F1DC" stroke="#25345C" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'HDPE_RIGID':
    case 'containers':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Soft shadow */}
            <ellipse cx="32" cy="58" rx="16" ry="3" fill="#EDE4D8" />
            {/* Jug body */}
            <path
              d="M20 28C20 22 23 18 29 18H38C42 18 44 21 44 26V50C44 54 41 56 36 56H26C22 56 20 53 20 48V28Z"
              fill="#FAF5EC"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Handle */}
            <path
              d="M20 28H15C13 28 12 30 12 33V42C12 45 13 47 16 47H20"
              fill="none"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Cap */}
            <rect x="29" y="10" width="8" height="8" rx="2" fill="#25345C" />
            {/* Label */}
            <rect x="24" y="32" width="16" height="14" rx="2" fill="#C9F1DC" stroke="#25345C" strokeWidth="1.5" />
            <line x1="28" y1="38" x2="36" y2="38" stroke="#12613F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'ALUMINUM_CANS':
    case 'cans':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Soft shadow */}
            <ellipse cx="32" cy="58" rx="14" ry="3" fill="#EDE4D8" />
            {/* Can cylinder */}
            <path
              d="M22 18C22 14.6863 26.4772 12 32 12C37.5228 12 42 14.6863 42 18V48C42 51.3137 37.5228 54 32 54C26.4772 54 22 51.3137 22 48V18Z"
              fill="#FAF5EC"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Top rim */}
            <ellipse cx="32" cy="18" rx="10" ry="4" fill="#C9F1DC" stroke="#25345C" strokeWidth="2" />
            {/* Pull tab */}
            <ellipse cx="32" cy="18" rx="3" ry="1.5" fill="#25345C" />
            {/* Graphic swirl */}
            <path d="M22 32C28 34 36 30 42 34" stroke="#F5BF55" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 38C28 40 36 36 42 40" stroke="#12613F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'TETRAPAK_BEVERAGE':
    case 'tetrapak':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="32" cy="58" rx="14" ry="3" fill="#EDE4D8" />
            {/* Gable top carton */}
            <path
              d="M22 24L32 14L42 24V52H22V24Z"
              fill="#C9F1DC"
              stroke="#25345C"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M32 14V24" stroke="#25345C" strokeWidth="2.5" />
            <circle cx="32" cy="34" r="5" fill="#F5BF55" stroke="#25345C" strokeWidth="1.5" />
            <rect x="26" y="42" width="12" height="4" rx="1" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'LDPE_FILM':
    case 'poly_film':
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="32" cy="58" rx="16" ry="3" fill="#EDE4D8" />
            {/* Clean folded poly wrap */}
            <path
              d="M18 26C18 20 24 18 32 18C40 18 46 20 46 26V46C46 52 40 54 32 54C24 54 18 52 18 46V26Z"
              fill="#E8FAF1"
              stroke="#25345C"
              strokeWidth="2.5"
            />
            <path
              d="M22 28C26 24 38 24 42 28"
              stroke="#12613F"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24 38C28 42 36 42 40 38"
              stroke="#25345C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    default:
      return (
        <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="32" cy="58" rx="16" ry="3" fill="#EDE4D8" />
            <rect x="18" y="16" width="28" height="38" rx="6" fill="#C9F1DC" stroke="#25345C" strokeWidth="2.5" />
            <path d="M24 28L32 36L40 28" stroke="#12613F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
  }
};
