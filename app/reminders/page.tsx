'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Clock, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

import { ReminderCard } from '@/components/ReminderCard';

export default function RemindersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const filteredReminders = reminders.filter(r => 
    r.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDoc(doc(db, 'reminders', deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-light text-white tracking-tight">{t('reminders')}</h2>
          <p className="text-[#e0d8d0]/30">{t('manage_tasks')}</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0d8d0]/20 group-focus-within:text-[#ff4e00] transition-colors" />
          <input 
            type="text" 
            placeholder={t('search_tasks')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-[#ff4e00]/30 focus:bg-white/[0.05] transition-all w-full md:w-80 text-white placeholder:text-[#e0d8d0]/20"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredReminders.map(reminder => (
          <ReminderCard 
            key={reminder.id} 
            reminder={reminder} 
            onDelete={(id) => setDeleteId(id)} 
          />
        ))}
        {filteredReminders.length === 0 && (
          <div className="col-span-full py-40 text-center space-y-6 opacity-10">
            <Calendar className="w-24 h-24 mx-auto stroke-[1px]" />
            <p className="text-2xl font-light italic">{t('no_reminders')}</p>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 p-8 rounded-[2rem] max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium text-white">{t('delete')}</h3>
                <p className="text-[#e0d8d0]/60">{t('delete_confirm')}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors font-medium"
                >
                  {t('delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
