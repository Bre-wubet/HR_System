import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from './Breadcrumb';

/**
 * Main Content Component
 * Wrapper for page content with breadcrumbs and animations
 */
const MainContent = ({ children, showBreadcrumb = true }) => {
  return (
    <main className="flex-1 flex flex-col min-w-0">
      {showBreadcrumb && <Breadcrumb />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 py-6 px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </main>
  );
};

export default MainContent;
