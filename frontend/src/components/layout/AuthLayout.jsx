import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo/Brand */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">HR</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            HR Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Streamline your human resources operations
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white py-8 px-6 shadow-soft rounded-xl border border-gray-100"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 HR Management System. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
