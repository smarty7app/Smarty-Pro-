'use client';

import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface ReminderCardProps {
  reminder: any;
  onDelete: (id: string) => void;
}

export const ReminderCard = ({ reminder, onDelete }: ReminderCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
    >
      <div className="flex justify-between items-center">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
          reminder.priority === 'high' ? 'bg-[#ff4e00]/10 text-[#ff4e00]' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {reminder.priority}
        </span>
        <button 
          onClick={() => onDelete(reminder.id)}
          className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl text-[#e0d8d0]/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="text-2xl font-light text-white leading-tight tracking-tight">{reminder.task}</h4>
      
      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#e0d8d0]/30 text-sm font-medium">
          <Clock className="w-4 h-4" />
          {format(new Date(reminder.datetime), 'MMM d, h:mm a')}
        </div>
        <span className="text-[10px] text-[#e0d8d0]/10 font-black uppercase tracking-[0.2em]">{reminder.category}</span>
      </div>
    </motion.div>
  );
};
