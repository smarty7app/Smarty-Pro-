'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Mic, ListTodo, Settings as SettingsIcon, 
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { id: '/', icon: LayoutDashboard, label: t('dashboard') },
    { id: '/assistant', icon: Mic, label: t('assistant') },
    { id: '/reminders', icon: ListTodo, label: t('reminders') },
    { id: '/settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <aside className={`relative z-30 bg-black/10 backdrop-blur-2xl border-r border-white/5 transition-all duration-700 flex flex-col ${isOpen ? 'w-80' : 'w-24'}`}>
      <div className="p-10 flex items-center gap-5">
        <Logo size={48} className="shadow-2xl shadow-[#ff4e00]/30 shrink-0" />
        {isOpen && <h1 className="text-2xl font-bold tracking-tighter text-white select-none pointer-events-none">Smarty</h1>}
      </div>

      <nav className="flex-1 px-6 py-12 space-y-3">
        {menuItems.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={item.id}
              className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-300 ${
                pathname === item.id 
                  ? 'bg-[#ff4e00] text-white shadow-2xl shadow-[#ff4e00]/20' 
                  : 'text-[#e0d8d0]/20 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              {isOpen && <span className="font-medium text-lg tracking-tight">{item.label}</span>}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="p-6">
        <motion.button 
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
          className="w-full p-5 rounded-[1.5rem] bg-white/[0.02] text-[#e0d8d0]/10 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center"
        >
          <ChevronRight className={`w-6 h-6 transition-transform duration-700 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </motion.button>
      </div>
    </aside>
  );
};
