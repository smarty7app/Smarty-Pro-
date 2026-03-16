'use client';

import { 
  LogOut, Volume2, Bell, Sparkles, Languages, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { signOut } from '@/lib/firebase';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (!user) return null;

  const languages = [
    { id: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      <header>
        <h2 className="text-4xl font-light text-white tracking-tight">{t('settings')}</h2>
        <p className="text-[#e0d8d0]/40 mt-2">Manage your Smarty profile and preferences.</p>
      </header>

      <div className="max-w-3xl space-y-12">
        <section className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-[#ff4e00] rounded-[2rem] flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-[#ff4e00]/20">
              {user.displayName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-3xl font-medium text-white tracking-tight">{user.displayName}</h3>
              <p className="text-[#e0d8d0]/40 text-lg">{user.email}</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={signOut} 
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 rounded-full text-sm font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              {t('sign_out')}
            </motion.button>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff4e00]/10 rounded-2xl flex items-center justify-center">
              <Languages className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <div>
              <h3 className="text-2xl font-medium text-white tracking-tight">{t('app_language')}</h3>
              <p className="text-[#e0d8d0]/40">{t('choose_language')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {languages.map((lang) => (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguage(lang.id as any)}
                className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center gap-4 ${
                  language === lang.id 
                    ? 'bg-[#ff4e00] border-[#ff4e00] text-white shadow-2xl shadow-[#ff4e00]/20' 
                    : 'bg-white/5 border-white/5 text-[#e0d8d0]/40 hover:bg-white/[0.08] hover:border-white/10'
                }`}
              >
                <span className="text-4xl mb-2">{lang.flag}</span>
                <div>
                  <p className={`text-xl font-bold ${language === lang.id ? 'text-white' : 'text-white/80'}`}>{lang.native}</p>
                  <p className="text-xs opacity-60 uppercase tracking-widest mt-1 font-bold">{lang.name}</p>
                </div>
                {language === lang.id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-white text-[#ff4e00] rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff4e00]/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <div>
              <h3 className="text-2xl font-medium text-white tracking-tight">{t('preferences')}</h3>
              <p className="text-[#e0d8d0]/40">Personalize your experience.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { key: 'voice_feedback', desc: 'Allow Smarty to speak back to you', icon: Volume2, active: true },
              { key: 'push_notifications', desc: 'Get alerts on your device', icon: Bell, active: true },
              { key: 'immersive_mode', desc: 'Enable full-screen voice interaction', icon: Sparkles, active: false },
            ].map(pref => (
              <div key={pref.key} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#ff4e00]/10 transition-colors">
                    <pref.icon className="w-7 h-7 text-[#ff4e00]" />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-white tracking-tight">{t(pref.key)}</p>
                    <p className="text-sm text-[#e0d8d0]/40">{pref.desc}</p>
                  </div>
                </div>
                <div className={`w-14 h-7 rounded-full p-1.5 transition-colors cursor-pointer ${pref.active ? 'bg-[#ff4e00]' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pref.active ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
