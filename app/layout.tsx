'use client';

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Sidebar } from '@/components/Sidebar';
import { IncomingCall } from '@/components/IncomingCall';
import { subscribeToSmartReminders, SmartReminder } from '@/lib/notifications';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<{ reminder: SmartReminder, type: 'PREPARATION' | 'FINAL' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const unsubscribe = subscribeToSmartReminders(user.uid, (reminder, type) => {
      setIncomingCall({ reminder, type });

      // 1. Written Notification (Browser)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Smarty Reminder", {
          body: `${reminder.task} - ${type === 'PREPARATION' ? 'Coming up soon!' : 'Time to act!'}`,
          icon: "/favicon.ico"
        });
      }

      // 2. Voice Announcement (TTS)
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Reminder: ${reminder.task}. ${type === 'PREPARATION' ? 'It is almost time.' : 'It is time now.'}`;
        msg.lang = 'en-US'; // Default to English, or detect from context
        window.speechSynthesis.speak(msg);
      }
    });

    return unsubscribe;
  }, [user]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    const field = incomingCall.type === 'PREPARATION' ? 'notified80' : 'notified100';
    await updateDoc(doc(db, 'reminders', incomingCall.reminder.id), {
      [field]: true
    });

    const task = incomingCall.reminder.task;
    const type = incomingCall.type;
    
    setIncomingCall(null);
    router.push(`/assistant?task=${encodeURIComponent(task)}&type=${type}`);
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    
    const field = incomingCall.type === 'PREPARATION' ? 'notified80' : 'notified100';
    await updateDoc(doc(db, 'reminders', incomingCall.reminder.id), {
      [field]: true
    });
    
    setIncomingCall(null);
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#3a1510] blur-[150px] opacity-30" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#ff4e00] blur-[150px] opacity-[0.07]" />
      </div>
      
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {children}
      </main>

      <IncomingCall 
        isOpen={!!incomingCall}
        reminder={incomingCall?.reminder}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0502] text-[#e0d8d0] selection:bg-[#ff4e00]/30`}>
        <AuthProvider>
          <LanguageProvider>
            <AppContent>{children}</AppContent>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
