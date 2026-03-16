import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = "", size = 40 }: LogoProps) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`} style={{ width: size, height: size }}>
      {/* Fallback to a styled div if image is missing */}
      <img 
        src="/logo.png" 
        alt="Smarty Logo" 
        width={size} 
        height={size}
        className="object-cover absolute inset-0 z-10"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Simple SVG fallback that resembles the uploaded image */}
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="w-[70%] h-[70%] bg-[#ff4e00] rounded-full flex items-center justify-center">
          <div className="w-[50%] h-[50%] bg-white rounded-full relative">
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
