import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  snapPoints = ['25%', '50%', '90%'], 
  initialSnap = 1,
  showHandle = true,
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);

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
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50"
            style={{ height: snapPoints[currentSnap] }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Content */}
            <div className="h-full overflow-y-auto pb-8 px-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
