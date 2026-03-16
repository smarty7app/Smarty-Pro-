import { db } from './firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

export interface SmartReminder {
  id: string;
  task: string;
  datetime: string;
  userId: string;
  notified80?: boolean;
  notified100?: boolean;
}

export const subscribeToSmartReminders = (userId: string, onCall: (reminder: SmartReminder, type: 'PREPARATION' | 'FINAL') => void) => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const now = new Date().getTime();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as SmartReminder;
      const reminderTime = new Date(data.datetime).getTime();
      const createdAt = (data as any).createdAt?.toDate()?.getTime() || (now - 3600000); // Fallback to 1h ago
      
      const totalDuration = reminderTime - createdAt;
      const elapsed = now - createdAt;
      const progress = elapsed / totalDuration;

      // 80% Preparation Call
      if (progress >= 0.8 && progress < 0.95 && !data.notified80) {
        onCall({ ...data, id: doc.id }, 'PREPARATION');
      }
      
      // 100% Final Call
      if (progress >= 1.0 && progress < 1.1 && !data.notified100) {
        onCall({ ...data, id: doc.id }, 'FINAL');
      }
    });
  });
};
