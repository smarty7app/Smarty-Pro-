'use client';

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CenterMicProps {
  isLive: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

export const CenterMic = ({ isLive, isConnecting, onClick }: CenterMicProps) => {
  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      <AnimatePresence>
        {isLive && (
          <>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#ff4e00] rounded-full blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-8 bg-[#ff4e00] rounded-full blur-2xl"
            />
          </>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={onClick}
        disabled={isConnecting}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: isLive ? 1.12 : 1.08 }}
        className={`relative z-20 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(255,78,0,0.2)] ${
          isLive 
            ? 'bg-white text-[#0a0502] scale-110' 
            : 'bg-[#ff4e00] text-white'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'active:opacity-90'}`}
      >
        {isConnecting ? (
          <Loader2 className="w-16 h-16 animate-spin" />
        ) : isLive ? (
          <MicOff className="w-16 h-16" />
        ) : (
          <Mic className="w-16 h-16" />
        )}
      </motion.button>
    </div>
  );
};
