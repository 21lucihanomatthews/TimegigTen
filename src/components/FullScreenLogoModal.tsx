import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FullScreenLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl?: string | null;
  name?: string;
  subtitle?: string;
  isVerified?: boolean;
  durationSeconds?: number;
}

export const FullScreenLogoModal: React.FC<FullScreenLogoModalProps> = ({
  isOpen,
  onClose,
  logoUrl,
  name = 'TimeGiG',
  durationSeconds = 5
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const totalMs = durationSeconds * 1000;
    const timer = setTimeout(() => {
      onClose();
    }, totalMs);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, durationSeconds, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="full-screen-logo-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[99999] bg-black w-screen h-screen select-none overflow-hidden cursor-pointer"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <span className="text-8xl sm:text-9xl font-black text-white tracking-tight">
                {name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
