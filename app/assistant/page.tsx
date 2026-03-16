'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type, Modality } from "@google/genai";

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function pcm16ToFloat32(pcmData: ArrayBuffer): Float32Array {
  const int16Array = new Int16Array(pcmData);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }
  return float32Array;
}

import { CenterMic } from '@/components/CenterMic';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function AssistantContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTranscription, setUserTranscription] = useState("");
  const [smartyTranscription, setSmartyTranscription] = useState("");
  const [reminderCreatedInSession, setReminderCreatedInSession] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const task = searchParams.get('task');
    const type = searchParams.get('type');
    
    if (task && type && user && !isLive && !isConnecting) {
      startSession({ task, type });
    }
  }, [searchParams, user]);

  const startSession = async (initialPrompt?: { task: string, type: string }) => {
    if (!user) return;
    setError(null);
    setIsConnecting(true);
    setReminderCreatedInSession(false);
    setUserTranscription("");
    setSmartyTranscription("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: `اسمك هو Smarty (سمارتي). أنت مساعد صوتي ذكي وودود جداً.
          - تنبيه هام: بمجرد أن تسمع اسمك "Smarty" أو "سمارتي"، يجب أن تقاطع صمتك فوراً وترد بترحيب حار مثل "نعم، أنا معك!" أو "أهلاً بك، كيف أساعدك؟".
          - لا تنتظر جملة كاملة من المستخدم؛ إذا ناداك باسمك فقط، رد عليه فوراً لتؤكد أنك تسمعه.
          - مهمتك الأساسية هي مساعدة المستخدم في تنظيم حياته عبر التذكيرات.
          - إذا طلب المستخدم تذكيره بشيء، استخدم أداة "create_reminder".
          - كن ودوداً، مختصراً، وذكياً في ردودك.
          - الوقت الحالي هو: ${new Date().toLocaleString()}.
          - تحدث باللغة التي يبدأ بها المستخدم (عربي، إنجليزي، أو فرنسي).`,
          tools: [{
            functionDeclarations: [{
              name: "create_reminder",
              description: "أنشئ تذكيراً جديداً للمستخدم",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING, description: "وصف المهمة" },
                  datetime: { type: Type.STRING, description: "التاريخ والوقت بصيغة ISO" },
                  priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  category: { type: Type.STRING, description: "تصنيف المهمة (مثلاً: عمل، شخصي، صحة)" }
                },
                required: ["task", "datetime"]
              }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsLive(true);
            
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData)));
              sessionPromise.then(session => {
                if (session) {
                  session.sendRealtimeInput({ media: { data: base64Data, mimeType: "audio/pcm;rate=16000" } });
                }
              });
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            if (initialPrompt) {
              sessionPromise.then(session => {
                if (session) {
                  session.sendRealtimeInput({ text: `أريد تذكير المستخدم بخصوص: ${initialPrompt.task}. هذا تذكير ${initialPrompt.type === 'PREPARATION' ? 'مسبق' : 'نهائي'}.` });
                }
              });
            }
          },
          onmessage: async (msg: any) => {
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData) {
                  const pcmData = base64ToArrayBuffer(part.inlineData.data);
                  const float32Data = pcm16ToFloat32(pcmData);
                  
                  const audioBuffer = audioContext.createBuffer(1, float32Data.length, OUTPUT_SAMPLE_RATE);
                  audioBuffer.copyToChannel(float32Data, 0);
                  
                  const startTime = Math.max(audioContext.currentTime, nextStartTimeRef.current);
                  const source = audioContext.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(audioContext.destination);
                  source.start(startTime);
                  
                  nextStartTimeRef.current = startTime + audioBuffer.duration;
                }
                if (part.text) {
                  setSmartyTranscription(prev => prev + " " + part.text);
                }
              }
            }

            const toolCall = msg.serverContent?.modelTurn?.parts?.find((p: any) => p.functionCall)?.functionCall;
            if (toolCall?.name === "create_reminder") {
              const args = toolCall.args as any;
              try {
                setReminderCreatedInSession(true);
                await addDoc(collection(db, 'reminders'), {
                  ...args,
                  userId: user.uid,
                  createdAt: serverTimestamp()
                });
                sessionPromise.then(session => {
                  if (session) {
                    session.sendToolResponse({
                      functionResponses: [{
                        id: toolCall.id,
                        name: "create_reminder",
                        response: { success: true }
                      }]
                    });
                  }
                });
              } catch (err) {
                console.error("Failed to save reminder:", err);
              }
            }
          },
          onclose: () => stopSession(),
          onerror: (err) => {
            console.error("Live API error details:", err);
            setError(t('connection_lost'));
            stopSession();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "تعذر الاتصال بالذكاء الاصطناعي أو الوصول للميكروفون.");
      setIsConnecting(false);
    }
  };

  const stopSession = async () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        if (session) session.close();
      });
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLive(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="w-full max-w-lg flex flex-col items-center justify-center space-y-16">
        <CenterMic 
          isLive={isLive} 
          isConnecting={isConnecting} 
          onClick={isLive ? stopSession : () => startSession()} 
        />

        <div className="text-center space-y-6">
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 text-[#ff4e00] font-medium"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('connecting')}</span>
              </motion.div>
            ) : isLive ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <h3 className="text-3xl font-light text-white tracking-tight">{t('smarty_listening')}</h3>
                <p className="text-[#e0d8d0]/30 text-sm uppercase tracking-[0.2em] animate-pulse">{t('say_smarty')}</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <h3 className="text-3xl font-light text-white tracking-tight">{t('tap_to_speak')}</h3>
                <p className="text-[#e0d8d0]/30 text-sm">{t('start_voice_session')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-5 bg-red-500/5 border border-red-500/10 rounded-3xl text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white/40 italic">{t('loading_assistant')}</div>}>
      <AssistantContent />
    </Suspense>
  );
}
