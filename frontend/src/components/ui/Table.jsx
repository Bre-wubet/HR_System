import React from 'react';

/**
 * Table Component
 * A reusable table component with sorting, selection, and loading states
 */
export const Table = ({ 
  data = [], 
  columns = [], 
  loading = false, 
  onSelectRow, 
  onSelectAll, 
  selectedRows = [], 
  emptyMessage = "No data available" 
}) => {
  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  const handleSelectRow = (rowId) => {
    if (onSelectRow) {
      onSelectRow(rowId);
    }
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  if (loading) {
    return (
      <div className="min-w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="min-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Selection column */}
            {(onSelectRow || onSelectAll) && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            
            {/* Data columns */}
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Selection cell */}
              {(onSelectRow || onSelectAll) && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
              )}
              
              {/* Data cells */}
              {columns.map((column, colIndex) => (
                <td
                  key={column.key || colIndex}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
