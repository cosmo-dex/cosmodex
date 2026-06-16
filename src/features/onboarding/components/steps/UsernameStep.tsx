'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '../../types/onboarding';
import { checkUsernameExists } from '@/features/auth/actions/manual-auth';

interface UsernameStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
}

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function UsernameStep({ data, onNext, onBack, updateData }: UsernameStepProps) {
  const [username, setUsername] = useState(data.username);
  const [isTyping, setIsTyping] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [submitting, setSubmitting] = useState(false);

  const formatOk = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  const runCheck = useCallback(async (value: string) => {
    const fmtOk = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
    if (!fmtOk) {
      setCheckState(value.length > 0 ? 'invalid' : 'idle');
      return;
    }
    setCheckState('checking');
    const { exists } = await checkUsernameExists(value);
    setCheckState(exists ? 'taken' : 'available');
  }, []);

  const handleBlur = () => {
    setIsTyping(false);
    runCheck(username);
  };

  const handleNext = async () => {
    if (!formatOk || submitting) return;
    if (checkState !== 'available') {
      setSubmitting(true);
      const { exists } = await checkUsernameExists(username);
      setSubmitting(false);
      if (exists) { setCheckState('taken'); return; }
      setCheckState('available');
    }
    updateData({ username });
    onNext();
  };

  const statusMessage = () => {
    if (isTyping) return null;
    switch (checkState) {
      case 'checking': return { text: 'Checking availability…', color: 'text-white/50' };
      case 'available': return { text: 'Callsign available ✓', color: 'text-[#D95FD1]' };
      case 'taken': return { text: 'Callsign already taken.', color: 'text-rose-400' };
      case 'invalid': return username.length > 0
        ? { text: 'Min 3 chars, letters/numbers/_ only.', color: 'text-rose-400' }
        : null;
      default: return null;
    }
  };

  const status = statusMessage();
  const canProceed = formatOk && checkState !== 'taken' && !submitting;

  const trailingIcon = () => {
    if (isTyping || checkState === 'idle') return null;
    if (checkState === 'checking') return <Loader2 size={20} className="animate-spin text-white/40" />;
    if (checkState === 'available') return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#E873C3]">
        <CheckCircle size={20} />
      </motion.div>
    );
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-rose-400">
        <XCircle size={20} />
      </motion.div>
    );
  };

  return (
    <div className="cosmo-glass p-8 sm:p-12 w-full">
      <button onClick={onBack} className="absolute left-6 top-6 text-white/50 hover:text-white transition-colors">
        <ArrowLeft size={20} />
      </button>

      <div className="text-center mb-10 mt-2">
        <h2 className="text-2xl font-display font-bold mb-2">Assign Callsign</h2>
        <p className="text-cosmo-text-muted text-sm">Choose a unique identifier for the universe.</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setIsTyping(true);
              setCheckState('idle');
            }}
            onBlur={handleBlur}
            placeholder="e.g. starweaver_99"
            className="cosmo-input font-mono text-center text-xl tracking-wider py-5"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {trailingIcon()}
          </div>
        </div>

        <div className="flex justify-center h-5">
          {status && (
            <motion.span
              key={checkState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs ${status.color}`}
            >
              {status.text}
            </motion.span>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="cosmo-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Verifying…</>
            : <>Confirm Trajectory <ArrowRight size={18} /></>
          }
        </button>
      </div>
    </div>
  );
}
