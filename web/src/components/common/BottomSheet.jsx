import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  height = 'auto',
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[1000]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-[1001] bg-white rounded-t-xl shadow-2xl ${className}`}
            style={{ maxHeight: height === 'auto' ? '80vh' : height }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
