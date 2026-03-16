'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, Bell, CheckCircle2, ChevronRight, LogIn, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { signIn, db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid),
      orderBy('datetime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReminders(data);
    });

    return unsubscribe;
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Logo size={120} className="mx-auto mb-8 shadow-2xl shadow-[#ff4e00]/20" />
          <h2 className="text-5xl lg:text-7xl font-light leading-tight text-white select-none pointer-events-none">
            Simple. <span className="italic font-serif text-[#ff4e00]">Smart.</span>
          </h2>
          <p className="text-xl text-[#e0d8d0]/60 max-w-md mx-auto">
            {t('welcome')}
          </p>
          <button 
            onClick={signIn}
            className="mt-8 flex items-center gap-3 px-10 py-5 bg-[#ff4e00] text-white rounded-full font-bold text-lg hover:bg-[#ff4e00]/90 transition-all shadow-xl shadow-[#ff4e00]/20 mx-auto"
          >
            <LogIn className="w-6 h-6" />
            <span>{t('get_started')}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-light text-white tracking-tight">
            {t('hello')} <span className="font-medium">{user.displayName?.split(' ')[0]}</span>
          </h2>
          <p className="text-[#e0d8d0]/30 text-lg">{t('day_at_glance')}</p>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="space-y-0.5">
            <p className="text-white/60 text-sm uppercase tracking-widest font-medium">{format(new Date(), 'EEEE, MMM d')}</p>
            <p className="text-4xl font-light text-[#ff4e00] font-mono">{format(new Date(), 'HH:mm')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="lg:col-span-8"
        >
          <Link 
            href="/assistant" 
            className="relative overflow-hidden p-10 bg-[#ff4e00] rounded-[3rem] group cursor-pointer flex flex-col justify-between min-h-[320px] shadow-2xl shadow-[#ff4e00]/20 w-full h-full block"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-4xl font-bold text-white tracking-tight">{t('talk_to_smarty')}</h3>
              <p className="text-white/80 text-lg max-w-md">{t('start_voice_session')}</p>
            </div>
            <div className="flex items-center gap-2 text-white/60 font-medium group-hover:gap-4 transition-all">
              <span>{t('start_session')}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex-1 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col justify-center space-y-2"
          >
            <p className="text-5xl font-light text-white">{reminders.length}</p>
            <p className="text-xs text-[#e0d8d0]/30 uppercase tracking-[0.2em] font-bold">{t('active_reminders')}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex-1 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col justify-center space-y-2"
          >
            <p className="text-5xl font-light text-white">{completedCount}</p>
            <p className="text-xs text-[#e0d8d0]/30 uppercase tracking-[0.2em] font-bold">{t('completed_today')}</p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-medium text-white tracking-tight">{t('upcoming')}</h3>
            <Link href="/reminders" className="text-sm text-[#ff4e00] hover:opacity-80 transition-opacity font-medium">{t('view_all')}</Link>
          </div>
          <div className="space-y-4">
            {reminders.slice(0, 3).map(reminder => (
              <div key={reminder.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.06] transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className={`w-1.5 h-1.5 rounded-full ${reminder.priority === 'high' ? 'bg-[#ff4e00]' : 'bg-blue-500'}`} />
                  <div>
                    <h4 className="text-white text-lg font-medium">{reminder.task}</h4>
                    <p className="text-sm text-[#e0d8d0]/30">{format(new Date(reminder.datetime), 'h:mm a')}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-[#e0d8d0]/10 group-hover:text-[#ff4e00] transition-colors">{reminder.category}</span>
              </div>
            ))}
            {reminders.length === 0 && (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-[2.5rem] opacity-20 italic text-lg">
                {t('no_reminders')}
              </div>
            )}
          </div>
        </section>

        <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8 flex flex-col justify-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-medium text-white tracking-tight">{t('smart_insights')}</h3>
            <p className="text-[#e0d8d0]/30">{t('ai_suggestions')}</p>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 bg-[#ff4e00]/10 rounded-2xl flex items-center justify-center">
                <Logo size={24} className="select-none pointer-events-none" />
              </div>
              <p className="text-lg text-[#e0d8d0]/60 leading-relaxed">
                {t('urgent_tasks_prefix')} <span className="text-white font-medium select-none pointer-events-none">{reminders.filter(r => r.priority === 'high').length} urgent</span> {t('urgent_tasks_suffix')}
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-[10px] text-[#ff4e00] uppercase tracking-[0.2em] mb-3 font-black">{t('pro_tip')}</p>
              <p className="text-[#e0d8d0]/60 italic text-lg leading-relaxed">{t('pro_tip_desc')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
