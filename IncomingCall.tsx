'use client';

import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IncomingCallProps {
  isOpen: boolean;
  reminder: any;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCall = ({ isOpen, reminder, onAccept, onDecline }: IncomingCallProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser"));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-[#1a1614] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ff4e00] rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <User className="w-12 h-12 text-[#ff4e00]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white text-xl font-medium tracking-tight">Smarty Calling</h4>
                <p className="text-[#e0d8d0]/40 text-sm italic">Regarding: {reminder?.task}</p>
              </div>

              <div className="flex gap-12 pt-4">
                <button
                  onClick={onDecline}
                  className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
                <button
                  onClick={onAccept}
                  className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all animate-bounce"
                >
                  <Phone className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
