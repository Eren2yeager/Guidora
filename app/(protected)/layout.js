'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import SecureLayout from '@/layouts/secureLayout';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OfflineIndicator from '@/components/layout/OfflineIndicator';
import { pageTransition } from '@/lib/animations';

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <SecureLayout>
      <OfflineIndicator />
      <Navbar />
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
      {/* <Footer /> */}
    </SecureLayout>
  );
}


