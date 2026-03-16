'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    welcome: "مرحباً بك في Smartry",
    assistant: "المساعد الصوتي",
    reminders: "التذكيرات",
    settings: "الإعدادات",
    dashboard: "لوحة التحكم",
    talk_to_smarty: "تحدث إلى Smarty",
    active_reminders: "تذكيرات نشطة",
    completed_today: "مكتمل اليوم",
    upcoming: "التذكيرات القادمة",
    smart_insights: "رؤى ذكية",
    sign_out: "تسجيل الخروج",
    get_started: "ابدأ الآن",
    listening: "Smarty يستمع...",
    tap_to_speak: "اضغط للتحدث مع Smarty",
    search_tasks: "البحث في المهام...",
    no_reminders: "لا توجد تذكيرات مجدولة",
    app_language: "لغة التطبيق",
    choose_language: "اختر لغتك المفضلة",
    preferences: "التفضيلات",
    voice_feedback: "الرد الصوتي",
    push_notifications: "التنبيهات",
    immersive_mode: "الوضع الغامر",
    profile: "الملف الشخصي",
    connecting: "جاري الاتصال بـ Smarty...",
    smarty_listening: "Smarty يستمع إليك",
    say_smarty: "قل 'Smarty' لجذب انتباهي",
    start_voice_session: "ابدأ جلسة صوتية مع مساعدك",
    loading_assistant: "جاري تحميل المساعد...",
    connection_lost: "فقد الاتصال. يرجى المحاولة مرة أخرى.",
    hello: "مرحباً،",
    day_at_glance: "يومك في لمحة سريعة.",
    start_session: "ابدأ الجلسة",
    view_all: "عرض الكل",
    ai_suggestions: "اقتراحات مدعومة بالذكاء الاصطناعي ليومك.",
    urgent_tasks_prefix: "لديك",
    urgent_tasks_suffix: "مهام عاجلة. يوصي Smarty بالبدء بها للبقاء في المقدمة.",
    pro_tip: "نصيحة ذكية",
    pro_tip_desc: "'جرب قول: سمارتي، ذكرني بأخذ استراحة بعد ساعتين للحفاظ على تركيزك.'",
    manage_tasks: "إدارة مهامك القادمة.",
    delete_confirm: "هل أنت متأكد أنك تريد حذف هذا التذكير؟",
    cancel: "إلغاء",
    delete: "حذف",
  },
  en: {
    welcome: "Welcome to Smartry",
    assistant: "Voice Assistant",
    reminders: "Reminders",
    settings: "Settings",
    dashboard: "Dashboard",
    talk_to_smarty: "Talk to Smarty",
    active_reminders: "Active Reminders",
    completed_today: "Completed Today",
    upcoming: "Upcoming Reminders",
    smart_insights: "Smart Insights",
    sign_out: "Sign Out",
    get_started: "Get Started",
    listening: "Smarty is listening...",
    tap_to_speak: "Tap to speak with Smarty",
    search_tasks: "Search tasks...",
    no_reminders: "No reminders scheduled",
    app_language: "App Language",
    choose_language: "Choose your preferred language",
    preferences: "Preferences",
    voice_feedback: "Voice Feedback",
    push_notifications: "Push Notifications",
    immersive_mode: "Immersive Mode",
    profile: "Profile",
    connecting: "Connecting to Smarty...",
    smarty_listening: "Smarty is listening",
    say_smarty: "Say 'Smarty' to get my attention",
    start_voice_session: "Start a voice session with your assistant",
    loading_assistant: "Loading Assistant...",
    connection_lost: "Connection lost. Please try again.",
    hello: "Hello,",
    day_at_glance: "Your day at a glance.",
    start_session: "Start session",
    view_all: "View all",
    ai_suggestions: "AI-powered suggestions for your day.",
    urgent_tasks_prefix: "You have",
    urgent_tasks_suffix: "urgent tasks. Smarty recommends tackling them first to stay ahead.",
    pro_tip: "Pro Tip",
    pro_tip_desc: "'Try saying: Smarty, remind me to take a break in 2 hours to maintain focus.'",
    manage_tasks: "Manage your upcoming tasks.",
    delete_confirm: "Are you sure you want to delete this reminder?",
    cancel: "Cancel",
    delete: "Delete",
  },
  fr: {
    welcome: "Bienvenue sur Smartry",
    assistant: "Assistant Vocal",
    reminders: "Rappels",
    settings: "Paramètres",
    dashboard: "Tableau de bord",
    talk_to_smarty: "Parler à Smarty",
    active_reminders: "Rappels Actifs",
    completed_today: "Terminé Aujourd'hui",
    upcoming: "Rappels à Venir",
    smart_insights: "Insights Intelligents",
    sign_out: "Se Déconnecter",
    get_started: "Commencer",
    listening: "Smarty écoute...",
    tap_to_speak: "Appuyez pour parler à Smarty",
    search_tasks: "Rechercher des tâches...",
    no_reminders: "Aucun rappel prévu",
    app_language: "Langue de l'application",
    choose_language: "Choisissez votre langue préférée",
    preferences: "Préférences",
    voice_feedback: "Retour Vocal",
    push_notifications: "Notifications Push",
    immersive_mode: "Mode Immersif",
    profile: "Profil",
    connecting: "Connexion à Smarty...",
    smarty_listening: "Smarty est à l'écoute",
    say_smarty: "Dites 'Smarty' pour attirer mon attention",
    start_voice_session: "Démarrer une session vocale avec votre assistant",
    loading_assistant: "Chargement de l'assistant...",
    connection_lost: "Connexion perdue. Veuillez réessayer.",
    hello: "Bonjour,",
    day_at_glance: "Votre journée en un coup d'œil.",
    start_session: "Démarrer la session",
    view_all: "Voir tout",
    ai_suggestions: "Suggestions basées sur l'IA pour votre journée.",
    urgent_tasks_prefix: "Vous avez",
    urgent_tasks_suffix: "tâches urgentes. Smarty recommande de les traiter en premier pour garder une longueur d'avance.",
    pro_tip: "Conseil de Pro",
    pro_tip_desc: "'Essayez de dire : Smarty, rappelle-moi de faire une pause dans 2 heures pour rester concentré.'",
    manage_tasks: "Gérez vos tâches à venir.",
    delete_confirm: "Êtes-vous sûr de vouloir supprimer ce rappel ?",
    cancel: "Annuler",
    delete: "Supprimer",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
