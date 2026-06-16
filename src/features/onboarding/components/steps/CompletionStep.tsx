'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Rocket, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OnboardingData } from '../../types/onboarding';
import { signUpUser, saveOnboardingProfile } from '@/features/auth/actions/manual-auth';

interface CompletionStepProps {
  data: OnboardingData;
}

type Status = 'loading' | 'success' | 'error';

export default function CompletionStep({ data }: CompletionStepProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Syncing data with the network…');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        if (data.authMethod !== 'Email') {
          setMessage('Saving your profile selections…');

          const result = await saveOnboardingProfile(
            data.avatarId || '',
            data.experienceLevel || '',
            data.interests || []
          );

          if (result.error) {
            setStatus('error');
            setMessage(result.error);
            return;
          }

          setStatus('success');
          setMessage("You're all set. Redirecting…");
          await new Promise(r => setTimeout(r, 1200));
          router.push('/dashboard');
          router.refresh();
          return;
        }

        if (!data.email || !data.password) {
          setStatus('error');
          setMessage('Missing credentials. Please go back and try again.');
          return;
        }

        setMessage('Creating your account…');

        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('username', data.username);
        formData.append('avatarId', data.avatarId || '');
        formData.append('experienceLevel', data.experienceLevel || '');
        formData.append('interests', JSON.stringify(data.interests || []));

        const result = await signUpUser(formData);

        if (result.error) {
          setStatus('error');
          setMessage(result.error);
          return;
        }

        setStatus('success');

        if (result.hasSession) {
          setMessage('Account created! Redirecting to dashboard…');
          await new Promise(r => setTimeout(r, 1500));
          router.push('/dashboard');
          router.refresh();
        } else {
          setMessage(
            result.message || 'Signup successful! Please check your email to verify before logging in.'
          );
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    run();
  }, [data, router]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 mt-24">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 relative"
      >
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white drop-shadow-lg relative z-10">
          Welcome Aboard,<br /> <span className="text-gradient-1">{data.username}</span>
        </h2>
        <p className="text-cosmo-text-muted text-lg relative z-10">{message}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10 overflow-hidden group">
          {status === 'loading' && (
            <>
              <motion.div
                className="absolute bottom-0 w-full bg-cyan-500"
                initial={{ height: '0%' }}
                animate={{ height: '75%' }}
                transition={{ delay: 0.8, duration: 2.5, ease: 'easeInOut' }}
              />
              <Rocket size={32} className="text-white relative z-10 drop-shadow-md" />
            </>
          )}
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle size={36} className="text-emerald-400 relative z-10 drop-shadow-md" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <XCircle size={36} className="text-red-400 relative z-10 drop-shadow-md" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {status === 'error' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.back()}
          className="cosmo-btn-secondary px-8 py-3 text-sm"
        >
          Go Back
        </motion.button>
      )}

      {status === 'success' && message.toLowerCase().includes('check your email') && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push('/onboarding')}
          className="cosmo-btn-primary px-8 py-3 text-sm relative z-20"
        >
          Go to Login
        </motion.button>
      )}
    </div>
  );
}
