import React from 'react';
import Image from 'next/image';

interface HologramGraphicProps {
  id?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSelected?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

export default function HologramGraphic({
  id = 'nebula',
  size = 'md',
  isSelected = false,
  className = '',
}: HologramGraphicProps) {
  const pixelSize = sizeMap[size] || 64;

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-2 ring-[#E873C3] shadow-[0_0_20px_rgba(232,115,195,0.5)]' : ''
      } ${className}`}
    >
      <Image
        src={`/images/avatars/${id.toLowerCase()}.webp`}
        alt={`${id} Hologram Avatar`}
        width={pixelSize}
        height={pixelSize}
        className="object-contain"
      />
    </div>
  );
}



