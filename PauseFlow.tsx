import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import PauseFlowEntry from '@/components/pause-flow/PauseFlowEntry';
import PauseFlowBreathing from '@/components/pause-flow/PauseFlowBreathing';
import PauseFlowAwareness from '@/components/pause-flow/PauseFlowAwareness';
import PauseFlowUrgeShield from '@/components/pause-flow/PauseFlowUrgeShield';
import PauseFlowChoice from '@/components/pause-flow/PauseFlowChoice';
import PauseFlowReinforcement from '@/components/pause-flow/PauseFlowReinforcement';

type Step = 'entry' | 'breathing' | 'awareness' | 'urge-shield' | 'choice' | 'reinforcement';

export default function PauseFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('entry');
  const [feeling, setFeeling] = useState('');
  const [todayCount, setTodayCount] = useState(0);

  // Fetch today's pause count
  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    supabase
      .from('pause_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .then(({ count }) => setTodayCount(count || 0));
  }, [user]);

  const logPause = useCallback(async (opts: { feeling?: string; duration: number; choseDeeper: boolean }) => {
    if (!user) return;
    await supabase.from('pause_sessions').insert({
      user_id: user.id,
      feeling: opts.feeling || null,
      duration_seconds: opts.duration,
      chose_deeper: opts.choseDeeper,
    });
    setTodayCount(c => c + 1);
  }, [user]);

  const handleFeelingSelect = (f: string, isUrge: boolean) => {
    setFeeling(f);
    if (isUrge) {
      setStep('urge-shield');
    } else {
      setStep('choice');
    }
  };

  const handleDone = async () => {
    await logPause({ feeling, duration: 60, choseDeeper: false });
    setStep('reinforcement');
  };

  const handleDeeper = async () => {
    await logPause({ feeling, duration: 60, choseDeeper: true });
    navigate('/compass');
  };

  const handleUrgeShieldComplete = () => {
    setStep('choice');
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <PauseFlowEntry
            key="entry"
            onStart={() => setStep('breathing')}
            onSkip={() => navigate('/compass')}
          />
        )}
        {step === 'breathing' && (
          <PauseFlowBreathing
            key="breathing"
            durationSeconds={60}
            onComplete={() => setStep('awareness')}
          />
        )}
        {step === 'awareness' && (
          <PauseFlowAwareness
            key="awareness"
            onSelect={handleFeelingSelect}
          />
        )}
        {step === 'urge-shield' && (
          <PauseFlowUrgeShield
            key="urge-shield"
            onComplete={handleUrgeShieldComplete}
          />
        )}
        {step === 'choice' && (
          <PauseFlowChoice
            key="choice"
            feeling={feeling}
            onDeeper={handleDeeper}
            onDone={handleDone}
          />
        )}
        {step === 'reinforcement' && (
          <PauseFlowReinforcement
            key="reinforcement"
            todayCount={todayCount}
            onContinue={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
