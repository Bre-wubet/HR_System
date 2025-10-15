import React from 'react';
import { motion } from 'framer-motion';
import StatCard from './StatCard';

/**
 * StatsGrid Component
 * Grid layout for displaying statistics cards
 */
const StatsGrid = ({ 
  stats = [], 
  loading = false, 
  columns = { 
    default: 1, 
    md: 2, 
    lg: 4 
  },
  onStatClick,
  className = ''
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid gap-4';
    const columnClasses = Object.entries(columns)
      .map(([breakpoint, cols]) => {
        if (breakpoint === 'default') {
          return `grid-cols-${cols}`;
        }
        return `${breakpoint}:grid-cols-${cols}`;
      })
      .join(' ');
    
    return `${baseClasses} ${columnClasses}`;
  };

  if (loading) {
    return (
      <div className={getGridClasses()}>
        {[...Array(columns.sm || 4)].map((_, index) => (
          <StatCard key={index} loading={true} />
        ))}
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard
            {...stat}
            onClick={onStatClick ? () => onStatClick(stat) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
