import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/outline';

interface FocusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  durationMinutes: number;
}

const FocusOverlay = ({ isOpen, onClose, taskTitle, durationMinutes }: FocusOverlayProps) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(durationMinutes * 60);
      setIsActive(true);
    }
  }, [isOpen, durationMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-anthracite/40 hover:text-anthracite transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-12"
          >
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">Focusing on</span>
            <h1 className="text-4xl md:text-6xl font-bold text-anthracite mb-4">{taskTitle}</h1>
          </motion.div>

          <div className="relative mb-16">
            <div className="text-[8rem] md:text-[12rem] font-bold text-anthracite tabular-nums leading-none">
              {formatTime(timeLeft)}
            </div>
            <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-20 h-20 rounded-full bg-anthracite/5 flex items-center justify-center hover:bg-anthracite/10 transition-all border border-anthracite/10"
            >
              {isActive ? (
                <PauseIcon className="w-8 h-8 text-anthracite" />
              ) : (
                <PlayIcon className="w-8 h-8 text-anthracite ml-1" />
              )}
            </button>
            <button 
              onClick={onClose}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-all shadow-sm"
            >
              <CheckIcon className="w-8 h-8 text-white font-bold" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-12">
          <div className="text-center">
            <div className="text-anthracite/40 text-xs uppercase mb-1">Session</div>
            <div className="text-anthracite font-medium">{durationMinutes}m</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs uppercase mb-1">Mode</div>
            <div className="text-primary font-medium">Deep Work</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusOverlay;
